import React from 'react'
import './Navbar.css'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();
    const navigate_word = () => {
        navigate('/word')
    }
    const navigate_sentences = () => {
        navigate('/sentence')
    }


  return (
    <div className='navbar-div'>
      <button onClick={navigate_word}>Word</button>
      <button onClick={navigate_sentences}>Sentences</button>
    </div>
  )
}

export default Navbar
