import { useState } from 'react'
import './Header.css'
import logOndas from '../../assets/logOndas.png'
import { useAuth } from '../../Contexto/TeLaComesSinPretexto'

import CoordiNav from '../Navbars/CoordiNavbar/CoordiNavbar'
import ProfeNav from '../Navbars/ProfeNavbar/ProfeNavbar'
import StudentNav from '../Navbars/EstudentNavbar/EstudentNavbar'

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { userData } = useAuth();

    // Función para renderizar el Navbar según el rol
    const renderNavbar = () => {


        switch (userData.rol) {
            case 'Coordinador':
                return <CoordiNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />;
            case 'Profesor':
                return <ProfeNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />;
            case 'Estudiante':
                return <StudentNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />;
            default:
                return null;
        }
    }

    return (
        <div className='HeaderPendejos'>
            <img className='logo-bton'
                src={logOndas}
                alt="Abrir menú"
                onClick={() => setDrawerOpen(true)}

            />
            {renderNavbar()} 
        </div>
    )
}

export default Header