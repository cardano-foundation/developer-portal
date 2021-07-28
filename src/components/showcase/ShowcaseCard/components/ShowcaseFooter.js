import React from 'react'
import Button from './Button';

const ShowcaseFooter = ({website,source}) => {
  return (
    <div className="card__footer">
    <div className="button-group button-group--block">
      {website && <Button text="Website" hrefValue={website} />}
      {source && <Button text="Source" hrefValue={source}/>}
    </div>
    </div>
  )
}



export default ShowcaseFooter;