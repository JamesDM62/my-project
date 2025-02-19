import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/LandingPage';
import SpotDetails from './components/Spots/SpotDetails/SpotDetails';
import CreateSpotForm from './components/Spots/SpotForm/CreateSpotForm';
import ManageReviews from './components/ManageReviews/ManageReviews';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import * as sessionActions from './store/session';
import ManageSpots from './components/Spots/ManageSpots/ManageSpots';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

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
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/spots/new',
        element: <CreateSpotForm />,
      },
      {
        path: '/spots/:spotId/edit',
        element: <CreateSpotForm />,
      },
      {
        path: '/spots/current',
        element: <ManageSpots />,
      },
      {
        path: '/reviews/current',
        element: <ManageReviews />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
