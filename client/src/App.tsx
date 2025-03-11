import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout } from './store/authSlice'
import { RootState } from './store'

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await axios.get("http://localhost:3000/api/users/user", {withCredentials: true});

        // if(user.data.status === 401) {
        //   const response = await axios.get("http://localhost:3000/api/auth/refreshtoken", {withCredentials: true})

          // if(!response.data.success) {
          //   return toast.error("Unauthorized");
          // }
          // dispatch(login(response.data.data));
        // }
        
        // if(!user.data.success) {
        //   return toast.error("Unauthorized");
        // }

        dispatch(login(user.data.data));
      } catch (error) {
        if(axios.isAxiosError(error) && error.status === 401) {
          try {
            const response = await axios.get("http://localhost:3000/api/auth/refreshtoken", {withCredentials: true})

            // if(!response.data.success) {
            //   return toast.error("Unauthorized");
            // }
            dispatch(login(response.data.data));
          } catch (error) {
            if (isAuthenticated) {
              toast.info('You have been logged out, please log in again !');
              dispatch(logout());
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [dispatch])
  if(loading) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  }
  return (
    <>
      <RouterProvider router={router}/> 
    </>
  )
}

export default App
