/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 import React, {useEffect, useState, useRef} from 'react';
 import ReactDOM from 'react-dom';
 import {usePopper} from 'react-popper';
 import styles from './styles.module.css';
 
 export default function Tooltip({
   children,
   id,
   anchorEl,
   text,
   delay,
 }){
   const [open, setOpen] = useState(false);
   const [referenceElement, setReferenceElement] = useState(
     null,
   );
   const [popperElement, setPopperElement] = useState(null);
   const [arrowElement, setArrowElement] = useState(null);
   const [container, setContainer] = useState(null);
   const {styles: popperStyles, attributes} = usePopper(
     referenceElement,
     popperElement,
     {
       modifiers: [
         {
           name: 'arrow',
           options: {
             element: arrowElement,
           },
         },
         {
           name: 'offset',
           options: {
             offset: [0, 8],
           },
         },
       ],
     },
   );
 
   const timeout = useRef(null);
   const tooltipId = `${id}_tooltip`;
 
   useEffect(() => {
     if (anchorEl) {
       if (typeof anchorEl === 'string') {
         setContainer(document.querySelector(anchorEl));
       } else {
         setContainer(anchorEl);
       }
     } else {
       setContainer(document.body);
     }
   }, [container, anchorEl]);
 
   useEffect(() => {
     const showEvents = ['mouseenter', 'focus'];
     const hideEvents = ['mouseleave', 'blur'];
 
     const handleOpen = () => {
       // There is no point in displaying an empty tooltip.
       if (text === '') {
         return;
       }
 
       // Remove the title ahead of time to avoid displaying
       // two tooltips at the same time (native + this one).
       referenceElement?.removeAttribute('title');
 
       timeout.current = window.setTimeout(() => {
         setOpen(true);
       }, delay || 400);
     };
 
     const handleClose = () => {
       clearInterval(!timeout.current);
       setOpen(false);
     };
 
     if (referenceElement) {
       showEvents.forEach((event) => {
         referenceElement.addEventListener(event, handleOpen);
       });
 
       hideEvents.forEach((event) => {
         referenceElement.addEventListener(event, handleClose);
       });
     }
 
     return () => {
       if (referenceElement) {
         showEvents.forEach((event) => {
           referenceElement.removeEventListener(event, handleOpen);
         });
 
         hideEvents.forEach((event) => {
           referenceElement.removeEventListener(event, handleClose);
         });
       }
     };
   }, [referenceElement, text, delay]);
 
   return (
     <>
       {React.cloneElement(children, {
         ref: setReferenceElement,
         'aria-describedby': open ? tooltipId : undefined,
       })}
       {container
         ? ReactDOM.createPortal(
             open && (
               <div
                 id={tooltipId}
                 role="tooltip"
                 ref={setPopperElement}
                 className={styles.tooltip}
                 style={popperStyles.popper}
                 {...attributes.popper}>
                 {text}
                 <span
                   ref={setArrowElement}
                   className={styles.tooltipArrow}
                   style={popperStyles.arrow}
                 />
               </div>
             ),
             container,
           )
         : container}
     </>
   );
 }