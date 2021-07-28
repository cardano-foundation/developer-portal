import React from 'react'

const Button = ({text,hrefValue}) => (
  <a
  className="button button--small button--secondary button--block"
  href={hrefValue}
  target="_blank"
  rel="noreferrer noopener"
>
  {text}
</a>
)

export default Button