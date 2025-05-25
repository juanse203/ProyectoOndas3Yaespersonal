import React from 'react'
import {useAuth} from '../../../Contexto/TeLaComesSinPretexto'
import { useNavigate } from "react-router-dom"

import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/Inbox';
import MailIcon from '@mui/icons-material/Mail';

const CoordiNavbar = ({ open, onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { text: 'Home', path: '/Home' },
        { text: 'Perfil', path: '/perfil' },
        { text: 'Gestión de usuarios', path: '/Usuarios' },
        { text: 'Proyectos', path: '/Proyectos' },
        { text: 'Reportes', path: '/Reportes' },
        { text: 'Cerrar sesión', path: 'logout' }, // la puerta de salida
    ];

    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 300 }} role="presentation" onClick={onClose}>
                <List>
                    {navItems.map(({ text, path }, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton onClick={() => {
                                if (path === 'logout') {
                                    logout();
                                    navigate('/');
                                } else {
                                    navigate(path);
                                }
                            }}>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}

export default CoordiNavbar