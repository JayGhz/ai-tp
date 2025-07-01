import { useState, useEffect } from 'react';
import ForceGraph from '@/components/ForceGraph';
import ModeloRNA from '@/components/ModeloRNA';
import Prediccion from '@/components/Prediccion';
import EDA from '@/components/EDA';
import { Dataset } from '@/components/Dataset';

declare global {
    interface Window {
        eventBus: {
            activeSection: string;
            changeSection: (section: string) => void;
        };
    }
}

const createGlobalEventBus = () => {
    if (!window.eventBus) {
        window.eventBus = {
            activeSection: localStorage.getItem('activeSection') || 'graph',
            changeSection: (section: string) => {
                window.eventBus.activeSection = section;
                localStorage.setItem('activeSection', section);
                window.dispatchEvent(new CustomEvent('sectionChanged'));
            },
        };
    }
    return window.eventBus;
};

export default function ContentManager() {
    const [activeComponent, setActiveComponent] = useState<string>(() => {
        const savedSection = localStorage.getItem('activeSection');
        return savedSection || 'graph';
    });

    useEffect(() => {
        const eventBus = createGlobalEventBus();
        
        setActiveComponent(eventBus.activeSection);


        const handleSectionChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ section: string }>;
            if (customEvent.detail && customEvent.detail.section) {
                eventBus.changeSection(customEvent.detail.section);
            }
        };

        const handleSectionChanged = () => {
            setActiveComponent(eventBus.activeSection);
        };

        document.addEventListener('sectionChange', handleSectionChange);
        window.addEventListener('sectionChanged', handleSectionChanged);
        
        const activeNavItem = document.querySelector('.nav-item.text-blue-500');
        if (activeNavItem) {
            const section = activeNavItem.getAttribute('data-section');
            if (section && section !== eventBus.activeSection) {
                eventBus.changeSection(section);
            }
        }

        return () => {
            document.removeEventListener('sectionChange', handleSectionChange);
            window.removeEventListener('sectionChanged', handleSectionChanged);
        };
    }, []);

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'graph':
                return <ForceGraph />; 
            case 'dataset':
                return <Dataset />;
            case 'modelo':
                return <ModeloRNA />;
            case 'prediccion':
                return <Prediccion />;
            case 'eda':
                return <EDA />;
            default:
                return <ForceGraph />;
        }
    };

    return (
        <div className="w-full h-full">
            {renderActiveComponent()}
        </div>
    );
}