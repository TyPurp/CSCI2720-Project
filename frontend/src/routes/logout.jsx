import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Logout() {
  

    const [redirected, setRedirected] = useState(false);
    const {logout} = useAuth();
    
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate('/');
        console.log("Redirecting...");
        setRedirected(true);
    }, []);
        

  return (
    redirected ? <div>Redirect to /login, click if not automatically redirected: <a href="/login">/login</a></div> : <></>
  )
}
