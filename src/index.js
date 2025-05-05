import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { jwtDecode } from 'jwt-decode';
import { privateRoutes, privateRoutes1, publicRoutes } from './route';
import favicon from '../src/asset/img/logo_tab.jpg';
document.querySelector("link[rel~='icon']").href = favicon;

const getToken = () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {publicRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
                {privateRoutes.map((route) => {
                    const token = getToken();
                    try {
                        const decoded = token ? jwtDecode(token) : null;
                        return decoded?.isAdmin ? (  // Khớp với thuộc tính của Header
                            <Route key={route.path} path={route.path} element={route.element} />
                        ) : (
                            <Route key="default" path="/" element={<App />} />
                        );
                    } catch (error) {
                        return <Route key="default" path="/" element={<App />} />;
                    }
                })}
                {privateRoutes1.map((route) => {
                    const token = getToken();
                    return token ? (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ) : (
                        <Route key="default" path="/" element={<App />} />
                    );
                })}
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

reportWebVitals();
