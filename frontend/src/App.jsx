import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/LandingPage';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import * as sessionActions from './store/session';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  useEffect(() => {
    document.title = "A Taste of Home";
  }, [location]);
  
  return (
    <>
      <Navigation isLoaded={isLoaded}/>
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
