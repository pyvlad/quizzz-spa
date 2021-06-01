"""
Reminder on validation order:

Validation is run in a specific, undocumented order:
1. Field deserialization called (serializer.to_internal_value and field.run_validators)
2. serializer.validate_[field] is called for each field
3. Serializer-level validators are called (serializer.run_validation followed by serializer.run_validators)
4. serializer.validate is called
src: https://stackoverflow.com/a/27591842

Nested serialized objects are deserialized as part of (1) because 
the nested collection is a field itself (ListSerializer field).
Therefore, for example, `validate_questions()` of EditableQuizSerializer 
runs after `validate()` method of each EditableQuestionSerializer.
"""
from django.db import transaction
from rest_framework import serializers

from .models import Quiz, Question, Option

from django.contrib.auth import get_user_model
User = get_user_model()


# *** BASIC QUIZ SERIALIZER ***
class ListedQuizSerializer(serializers.ModelSerializer):
    """
    Serializer to create new empty quiz (with questions) 
    or show existing ones in a list.
    """
    class Meta:
        model = Quiz
        fields = [
            'id',
            'name',
            'description',
            'is_finalized',
            'time_created',
            'time_updated',
            'user',
        ]
        read_only_fields = ['id', 'is_finalized', 'time_created', 'time_updated', 'user']



# *** EDITABLE QUIZ SERIALIZER ***
class EditableOptionSerializer(serializers.ModelSerializer):
    """
    This serializer is supposed to be nested into EditableQuestionSerializer
    in a ListSerializer field (i.e. with "many=True").
    """
    id = serializers.IntegerField() # for list updates (default id is read-only)
    
    class Meta:
        model = Option
        fields = [
            'id',
            'text', 
            'is_correct',
        ]

    def validate_text(self, data):
        """
        When quiz is finalized, "text" field is required.
        """
        is_finalized = self.root.initial_data.get("is_finalized", False)
        if is_finalized and not data:
            raise serializers.ValidationError("This field is required.")
        return data


class EditableQuestionSerializer(serializers.ModelSerializer):
    """
    This serializer is supposed to be nested into EditableQuizSerializer
    in a ListSerializer field (i.e. with "many=True").
    """
    id = serializers.IntegerField() # for list updates (default id is read-only)
    options = EditableOptionSerializer(many=True)

    class Meta: 
        model = Question
        fields = [
            'id',
            'text',
            'explanation',
            'options',
        ]

    def validate(self, data):
        """
        Object-level validation method.
        `data` is a dictionary of submitted field values.
        Because of validation order, can assume that required fields are present.
        """
        orm_question = self.get_nested_orm_question(data["id"])

        # submitted question belongs to the loaded quiz,
        # i.e. user cannot update other quizzes' questions:
        if orm_question is None:
            raise serializers.ValidationError("This question does not belong to this quiz.")
        
        orm_options_by_id = { option.id: option for option in orm_question.options.all() }
        new_options_by_id = { option["id"]: option for option in data["options"] }
        
        # submitted options belong to the question with current id and no option was omitted, 
        # i.e. user cannot update other questions' options or submit non-complete set of options:
        if (set(orm_options_by_id) != set(new_options_by_id)) \
            or len(orm_options_by_id) != len(new_options_by_id):
            raise serializers.ValidationError("This question has other option ids.")

        # submitted options have only one correct answer
        self.validate_single_correct_answer(new_options_by_id.values())
        return data

    def get_nested_orm_question(self, question_id):
        """
        Get Question ORM object assuming that the serializer is used for 
        a nested list of Question serializer objects in a Quiz serializer.
        """
        # The Serializer class is itself a type of Field, and can be used 
        # to represent relationships where one object type is nested inside another.
        # `self.root`: Returns the top-level serializer for this field.
        # https://github.com/encode/django-rest-framework/blob/9d149f23177055b3b1ea12cf62de0d669739b544/rest_framework/fields.py#L643
        quiz = self.root.instance
        orm_questions_by_id = { question.id: question for question in quiz.questions.all() }
        orm_question = orm_questions_by_id.get(question_id)
        return orm_question

    def validate_single_correct_answer(self, new_options):
        """
        There must be one and only one correct answer among question options when 
        quiz is being finalized. In a draft, no correct answer is allowed.
        """
        is_finalized = self.root.initial_data.get("is_finalized", False)
        num_correct_options = sum(option.get("is_correct") is True for option in new_options)
        error = None
        if is_finalized and num_correct_options == 0:
            error = "No correct answer selected."
        if num_correct_options > 1:
            error = "Multiple answers not allowed."
        if error:
            raise serializers.ValidationError(error)
        
    def validate_text(self, data):
        """
        When quiz is finalized, "text" field is required.
        """
        is_finalized = self.root.initial_data.get("is_finalized", False)
        if is_finalized and not data:
            raise serializers.ValidationError("This field is required.")
        return data


class EditableQuizSerializer(serializers.ModelSerializer):
    """
    Top-level serializer to edit a quiz together with questions and question options.
    """
    questions = EditableQuestionSerializer(many=True)

    class Meta: 
        model = Quiz
        fields = [
            'name',
            'description',
            'introduction',
            'is_finalized',
            'questions',
        ]
        extra_kwargs = {
            'is_finalized': {'required': True},
            'name': {'required': True},
            # options are required by default because it is a nested field
        }

    def validate_questions(self, data):
        """
        Validate that all questions have been submitted.
        
        Note:
            This validation is called after each question was validated.
            Passing a question with a bad id would cause a validation error there,
            therefore we must validate just the number of submitted questions 
            to make sure that all questions have been submitted.
        """
        quiz = self.instance
        new_questions_by_id = { question["id"]: question for question in data}
        orm_questions_by_id = { question.id: question for question in quiz.questions.all() }

        if len(new_questions_by_id) != len(orm_questions_by_id):
            raise serializers.ValidationError("This quiz has other question ids.")

        return data


    def update_quiz(self, orm_quiz, quiz_data):
        orm_quiz.name = quiz_data.get('name', orm_quiz.name)
        orm_quiz.description = quiz_data.get('description', orm_quiz.description)
        orm_quiz.introduction = quiz_data.get('introduction', orm_quiz.introduction)
        orm_quiz.is_finalized = quiz_data.get('is_finalized', orm_quiz.is_finalized)
        return orm_quiz

    def update_question(self, orm_question, question_data):
        orm_question.text = question_data.get('text', orm_question.text)
        orm_question.explanation = question_data.get('explanation', orm_question.explanation)
        return orm_question

    def update_option(self, orm_option, option_data):
        orm_option.text = option_data.get('text', orm_option.text)
        orm_option.is_correct = option_data.get('is_correct', orm_option.is_correct)
        return orm_option
                        

    def update(self, instance, validated_data):
        """
        Update Quiz object, related Question objects, and related Option objects.
        At this point, question and options ids as well as the presence of 
        required fields has been validated.

        Note:
            The default ModelSerializer .create() and .update() methods 
            do not include support for writable nested representations - 
            because the behavior of nested creates and updates can be ambiguous.
        """
        # keep all objects in a list to save together in a transaction:
        updated_objects = [self.update_quiz(instance, validated_data)]

        question_data_by_id = { q["id"]: q for q in validated_data['questions'] }

        for orm_question in instance.questions.all():

            question_data = question_data_by_id[orm_question.id]
            updated_objects += [self.update_question(orm_question, question_data)]
                
            option_data_by_id = { option["id"]: option for option in question_data["options"] }
            
            for orm_option in orm_question.options.all():
                option_data = option_data_by_id[orm_option.id]
                updated_objects += [self.update_option(orm_option, option_data)]

        # save changes:
        with transaction.atomic():
            for object in updated_objects:
                object.save()

        return instance

    def raise_question_field_validation_error(self, field, error, question_index):
        """
        Helper method to raise a validation error in nested question object 
        preserving error format while doing validation in a parent object.
        Currently not used - use it if you move validation from EditableQuestionSerializer
        up to EditableQuizSerializer (e.g. if you want to avoid references to `self.root`).
        
        For example,
        `self.raise_question_field_validation_error("options", "Option ids don't match.", 2)`
            would result in:
        {"questions": [{}, {}, {"options": ["Option ids don't match."]}]}
        """
        question_errors = [{} for _ in range(question_index)]
        question_errors += [{field: [error]}]
        raise serializers.ValidationError({"questions": question_errors})