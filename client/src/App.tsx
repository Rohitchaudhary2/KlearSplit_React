import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from './store/authSlice'
import { Box } from '@mui/material'
import HashLoader from "react-spinners/ClipLoader";
import { API_URLS } from './constants/apiUrls'
import axiosInstance from './utils/axiosInterceptor'
import { toast } from 'sonner'
import { RootState } from './store'

function App() {
  const [loading, setLoading] = useState(true);
  const user = useSelector((store: RootState) => store.auth.user)
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await axiosInstance.get(API_URLS.fetchUser, { withCredentials: true });

        dispatch(login(user.data.data)); // Dispatch the user data to the store
      } catch (error) {
        if(user) toast.error("Failed to fetch user data. Please try again later.");
      }
      setLoading(false);
    }

    getUser();
  }, [dispatch])
  if (loading) {
    return (
      <>
        <Box className="min-h-screen flex justify-center gap-4 items-center">
          <Box className="hidden md:flex w-1/2 text-white flex-col bg-no-repeat bg-contain bg-center">
            <h1 className="font-protest font-bold text-6xl text-end text-blue-400">
              KLEARSPLIT
            </h1>
          </Box>
          <Box className="grow">
            <HashLoader color="#209bff" size={100} />
          </Box>
        </Box>
      </>
    )
  }
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
