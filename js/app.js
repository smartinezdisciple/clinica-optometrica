function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const overlay = document.getElementById('sidebar-overlay');
    
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
        if(sidebar) sidebar.classList.toggle('-translate-x-full');
        if(overlay) overlay.classList.toggle('hidden');
    } else {
        if(sidebar) {
            sidebar.classList.toggle('w-64');
            sidebar.classList.toggle('w-20');
        }
        if(mainContent) {
            mainContent.classList.toggle('ml-64');
            mainContent.classList.toggle('ml-20');
        }
        if(header) {
            header.classList.toggle('w-[calc(100%-16rem)]');
            header.classList.toggle('w-[calc(100%-5rem)]');
        }
        if(footer) {
            footer.classList.toggle('w-[calc(100%-16rem)]');
            footer.classList.toggle('w-[calc(100%-5rem)]');
        }

        document.querySelectorAll('.nav-label').forEach(el => el.classList.toggle('hidden'));
        document.querySelectorAll('.logo-text').forEach(el => el.classList.toggle('hidden'));
    }
}

function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const links = document.querySelectorAll('#sidebar nav a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.className = 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-sm rounded-l-none rounded-r-full mr-4 flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight transition-all duration-200';
            const icon = link.querySelector('.material-symbols-outlined');
            if(icon) icon.style.fontVariationSettings = "'FILL' 1";
        } else {
            link.className = 'text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-all duration-200 flex items-center gap-3 px-4 py-3 font-manrope text-sm font-medium tracking-tight rounded-r-full mr-4';
            const icon = link.querySelector('.material-symbols-outlined');
            if(icon) icon.style.fontVariationSettings = "'FILL' 0";
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setActiveMenuItem();
});