import React from "react";
import { useDrag } from "react-dnd";

// function Card({id, src}) {
//     const [{isDragging}, drag] = useDrag(() => ({
//         type: "image",
//         item: {id: id},
//         // item: {id: value + suit},
//         collect: (monitor) => ({
//             isDragging: !!monitor.isDragging(),
//         })
//     }))
//     return (
//         <img
//             ref={drag}
//             src = {src}
//             width="150px"
//             style={{border: isDragging ? "5px solid pink" : "0px"}}
//         />
//     );
// }

function Card({ value, suit, id }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "image",
      item: { id: id, value: value, suit: suit },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [value, suit, id]
  );
  return (
    <img
      ref={drag}
      // src = {value + suit + '.png'}
      src={`../Cards/${value}${suit}.png`}
      width="150px"
      style={{ border: isDragging ? "5px solid pink" : "0px" }}
    />
  );
}

export default Card;
