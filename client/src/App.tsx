import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from './store/authSlice'
import { Box } from '@mui/material'
import HashLoader from "react-spinners/ClipLoader";
import { API_URLS } from './constants/apiUrls'
import axiosInstance from './utils/axiosInterceptor'

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      const user = await axiosInstance.get(API_URLS.fetchUser, { withCredentials: true });
      if (user) {
        dispatch(login(user.data.data));
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
