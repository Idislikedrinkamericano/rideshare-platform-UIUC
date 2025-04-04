import React from 'react';
import ReactDOM from 'react-dom/client';
import WeShare from './WeShare';
import './index.css'
import {BrowserRouter} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <WeShare/>
    </BrowserRouter>
);
