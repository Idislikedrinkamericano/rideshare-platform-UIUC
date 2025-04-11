import "./WeShare.css";
import {Navigate, Route, Routes, Router} from 'react-router-dom';
import Login from './login'
import Main from './main'

const WeShare = () => {
    return (
        <>
            <Routes>
                <Route path = {"/login"} element = {<Login/>}/>
                <Route path = {"/main"} element = {<Main/>}/>
                <Route path = {"/"} element = {<Navigate to = {"/main"}/>}/>
            </Routes>
        </>
    );
}

export default WeShare;