/* 
Hook that:
- uses `editedItemId` state variable to proxy which view to show to the user; 
  possible values:
    - [default] `null` means "show all items";
    - `id` that is present in the array means "edit this item";
    - `id` that is not present in the array means "create new item" (use 0 for clarity);
- returns items, edited item id, and handlers to update the array of 
  items when an item is being added/updated/deleted.

`getItemIdFunc` [optional] - how to get from an item object to its id.
*/
import React from 'react';


const useListUpdateDeleteViews = (items, setItems, getItemIdFunc) => {

  // default item ID getter
  const getItemId = getItemIdFunc ? getItemIdFunc : item => item.id;

  // local state
  const [editedItemId, setEditedItemId] = React.useState(null);

  // handlers
  const handleItemUpdated = (updatedItem) => {
    /*
      Handler to update/add an item in the array.

      `updatedItem` is an existing item in the array or a new item 
      to add to the array (when it has a non-existing `id`).
    */
    const prevList = items;
    let newList = [];

    // const itemIndex = prevList.findIndex(item => item.id === updatedItem.id);
    const itemIndex = prevList.findIndex(item => getItemId(item) === getItemId(updatedItem));
    if (itemIndex >= 0) {
      // modify the item keeping its position in the array:
      newList = [
        ...prevList.slice(0, itemIndex), 
        updatedItem,
        ...prevList.slice(itemIndex + 1)
      ]
    } else {
      // assume it's a new item - add to the beginning of the array:
      newList = [
        updatedItem,
        ...prevList,
      ]
    }
    setEditedItemId(null);
    setItems(newList);
  }

  const handleItemDeleted = (itemId) => {
    /*
      Handler to remove an item from the array by its `id`.
    */
    const itemIndex = items.findIndex(item => getItemId(item) === itemId);
    let newItems = items.slice();
    newItems.splice(itemIndex, 1);
    setEditedItemId(null);
    setItems(newItems);
  }

  return {
    editedItemId,
    setEditedItemId,
    handleItemUpdated,
    handleItemDeleted,
  }
}

export default useListUpdateDeleteViews;