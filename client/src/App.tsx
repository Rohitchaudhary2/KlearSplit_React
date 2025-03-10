import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
// import { useEffect } from 'react'
// import axios from 'axios'

function App() {
  // useEffect(() => {
  //   const res = async () => await axios.get("http://localhost:3000/api/users/user", {withCredentials: true});

  //   console.log(res());
    
  // })
  return (
    <>
      <RouterProvider router={router}/> 
    </>
  )
}

export default App
