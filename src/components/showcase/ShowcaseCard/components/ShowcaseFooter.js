import React from 'react'
import Button from './Button';

const ShowcaseFooter = ({getstarted,website,source}) => {
  return (
    <div className="card__footer">
    <div className="button-group button-group--block">
      {getstarted && <Button text="Get Started" hrefValue={getstarted}/>}
      {website && <Button text="Website" hrefValue={website} />}
      {source && <Button text="Source" hrefValue={source}/>}
    </div>
    </div>
  )
}



export default ShowcaseFooter;