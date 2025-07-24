import React, { useState } from 'react'
import './blog.css'
import user_icon from '../imgs/people.png'
import envelop_icon from '../imgs/envelope.png'
import key_icon from '../imgs/key.png' 
import hidden_icon from '../imgs/hidden.png'
import view_icon from '../imgs/view.png'

const InputBox = ({name, type, id, value, placeholder, iconType, icon, disable = false }) => {
    const getIcon = () => {
        if (iconType === 'email') return envelop_icon
        if (iconType === 'password') return key_icon
        return user_icon
      }
    const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div>
      <div className=' relative w-[100%] mb-4'>
        <input type={type=== 'password' ? passwordVisible ? 'text' : 'password' : type} name={name} placeholder={placeholder} id={id} disabled={disable} className='input-box'  />
        
        {
          icon ? <i className={'fi ' + icon + ' input-icon'}></i> : <img src={getIcon()}  alt="" className='input-icon' />
        }
        

        {
          type === 'password' ? <img src={passwordVisible ? view_icon : hidden_icon} className='input-icon left-[auto] right-4 cursor-pointer' onClick={() => setPasswordVisible(currentVal => !currentVal)} /> : '' 
        }
      </div>
      
    </div>
  )
}

export default InputBox;
