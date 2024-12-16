import React from "react"
import ImageMapper from 'react-img-mapper';


const Mapper = props => {
    return (
        <ImageMapper
            src={props.src}
            map={{
                name: 'my-map',
                areas: props.data
            }}
            onClick={props.onClick}
            responsive={true}
            natural={true}
            parentWidth={props.parentWidth}
            toggleHighlighted={false}
            
        />
    )
}

export default Mapper