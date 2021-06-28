import React from 'react';


const useListUpdateDeleteViews = (asyncFetchFunc) => {

  const [items, setItems] = React.useState([]);
  const [editedItemId, setEditedItemId] = React.useState(null);

  // On mount, fetch list of items
  React.useEffect(() => {
    async function fetchData() {
      try {
        setItems(await asyncFetchFunc());
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [setItems, asyncFetchFunc])

  // HANDLERS
  const handleItemUpdated = (updatedItem) => {
    const prevList = items;
    let newList = [];

    const itemIndex = prevList.findIndex(item => item.id === updatedItem.id);
    if (itemIndex >= 0) {
      newList = [
        ...prevList.slice(0, itemIndex), 
        updatedItem,
        ...prevList.slice(itemIndex + 1)
      ]
    } else {
      newList = [
        updatedItem,
        ...prevList,
      ]
    }
    setEditedItemId(null);
    setItems(newList);
  }

  const handleItemDeleted = (itemId) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    let newItems = items.slice();
    newItems.splice(itemIndex, 1);
    setEditedItemId(null);
    setItems(newItems);
  }

  // RETURN
  return {
    items,
    editedItemId,
    setEditedItemId,
    handleItemUpdated,
    handleItemDeleted,
  }
}

export default useListUpdateDeleteViews;