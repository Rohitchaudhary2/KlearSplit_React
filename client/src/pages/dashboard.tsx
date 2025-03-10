import axios from "axios"
import { useEffect } from "react"

const DashboardPage = () => {
    useEffect(() => {
        const res = async() => await axios.get("http://localhost:3000/api/users/user", {withCredentials: true, });

        console.log(res());
        
    })
    return (
        <>
            Hey Rohit
        </>
    )
}

export default DashboardPage