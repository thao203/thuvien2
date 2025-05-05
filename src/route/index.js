import AdminPage from '../Page/Admin/AdminPage';
import HistoryBook from '../Page/HomePage/Layouts/Main/HistoryBook/HistoryBook';
import HomePage from '../Page/HomePage/Layouts/HomePage/HomePage';
import Login from '../Page/Login/Login';
import Register from '../Page/Register/Register';
import InfoUser from '../Page/User/InfoUser';
import Forgetpassword from '../Page/Forgetpassword/forgetpassword';
import ChangePassword from '../Page/User/Changepassword/changepassword';
import LibraryIntro from '../Page/Support/About/About';
import ListBook from '../Page/HomePage/Layouts/Main/ListBook/listbook';
import DetailBook from '../Page/HomePage/Layouts/Main/DetaiBook/detailbook';
import Contact from '../Page/Support/Contact/Contact';
import Categories from '../Page/HomePage/Layouts/Main/Categories/Categories';
import DetailCategory from '../Page/HomePage/Layouts/Main/Categories/DetaiCategory';
import Guide from '../Page/Support/Guide/Guide';
import GetBookshelf from '../Page/Admin/Layouts/ManagementLocation/getBookshelf';
import Cart from '../Page/HomePage/Layouts/Main/ListBook/Cart';

export const publicRoutes = [
    { path: '', element: <Login /> },
    { path: '/reg', element: <Register /> },
    { path: '/forgot', element: <Forgetpassword /> },
    { path: '/about', element: <LibraryIntro /> },
    { path: '/contact', element: <Contact /> },
    { path: '/guide', element: <Guide /> },
    { path: '/getBookshelf', element: <GetBookshelf /> },

];

export const privateRoutes1 = [
    { path: '/homepage', element: <HomePage /> },
    { path: '/info', element: <InfoUser /> },
    { path: '/history', element: <HistoryBook /> },
    { path: '/changepass', element: <ChangePassword /> },
    { path: '/books', element: <ListBook /> },
    { path: '/categories', element: <Categories /> },
    { path: '/detailbook/:masach', element: <DetailBook /> },
    { path: '/detailCategory/:madanhmuc', element: <DetailCategory /> },
    { path: '/cart', element: <Cart /> },
];

export const privateRoutes = [{ path: '/admin', element: <AdminPage /> }];
