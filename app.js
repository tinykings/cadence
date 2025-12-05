// ===== Cadence Time Tracker App =====

class CadenceApp {
    constructor() {
        this.data = this.loadData();
        this.currentDate = new Date();
        this.init();
    }

    // ===== Data Management =====
    loadData() {
        const stored = localStorage.getItem('cadence-data');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            goal: 600,
            hours: {} // Format: { "2024-09-15": 3.5, "2024-09-16": 2 }
        };
    }

    saveData() {
        localStorage.setItem('cadence-data', JSON.stringify(this.data));
    }

    // ===== Year Calculation =====
    // Year runs from September to August
    getAcademicYear(date = this.currentDate) {
        const month = date.getMonth(); // 0-11
        const year = date.getFullYear();
        
        // If September or later, the academic year starts this year
        // If before September, the academic year started last year
        if (month >= 8) { // September = 8
            return { start: year, end: year + 1 };
        } else {
            return { start: year - 1, end: year };
        }
    }

    getAcademicYearLabel() {
        const { start, end } = this.getAcademicYear();
        return `${start}–${end.toString().slice(-2)}`;
    }

    // Get all months in the academic year (September to August)
    getAcademicYearMonths() {
        const { start, end } = this.getAcademicYear();
        const months = [];
        
        // September (8) to December (11) of start year
        for (let m = 8; m <= 11; m++) {
            months.push({ year: start, month: m });
        }
        // January (0) to August (7) of end year
        for (let m = 0; m <= 7; m++) {
            months.push({ year: end, month: m });
        }
        
        return months;
    }

    // Get months before current month in the academic year
    getPreviousMonths() {
        const allMonths = this.getAcademicYearMonths();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const previous = [];
        for (const m of allMonths) {
            // Stop when we reach current month
            if (m.year === currentYear && m.month === currentMonth) {
                break;
            }
            // Only add if we haven't reached it yet
            if (m.year < currentYear || (m.year === currentYear && m.month < currentMonth)) {
                previous.push(m);
            }
        }
        
        return previous.reverse(); // Most recent first
    }

    // ===== Hours Calculation =====
    getHoursForDay(year, month, day) {
        const key = this.formatDateKey(year, month, day);
        return this.data.hours[key] || 0;
    }

    setHoursForDay(year, month, day, hours) {
        const key = this.formatDateKey(year, month, day);
        if (hours > 0) {
            this.data.hours[key] = hours;
        } else {
            delete this.data.hours[key];
        }
        this.saveData();
    }

    addHoursForDay(year, month, day, hours) {
        const current = this.getHoursForDay(year, month, day);
        this.setHoursForDay(year, month, day, current + hours);
    }

    formatDateKey(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    getMonthTotal(year, month) {
        let total = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let d = 1; d <= daysInMonth; d++) {
            total += this.getHoursForDay(year, month, d);
        }
        
        return total;
    }

    getYearTotal() {
        const months = this.getAcademicYearMonths();
        let total = 0;
        
        for (const m of months) {
            total += this.getMonthTotal(m.year, m.month);
        }
        
        return total;
    }

    getRemainingMonths() {
        const allMonths = this.getAcademicYearMonths();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        let count = 0;
        let found = false;
        
        for (const m of allMonths) {
            if (m.year === currentYear && m.month === currentMonth) {
                found = true;
            }
            if (found) {
                count++;
            }
        }
        
        return count;
    }

    getMonthlyAverageNeeded() {
        const remaining = this.getRemainingMonths();
        if (remaining === 0) return 0;
        
        const yearTotal = this.getYearTotal();
        const hoursNeeded = this.data.goal - yearTotal;
        
        if (hoursNeeded <= 0) return 0;
        
        return Math.ceil(hoursNeeded / remaining);
    }

    // ===== UI Initialization =====
    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    cacheElements() {
        this.elements = {
            yearLabel: document.getElementById('yearLabel'),
            totalHours: document.getElementById('totalHours'),
            goalHours: document.getElementById('goalHours'),
            progressRing: document.getElementById('progressRing'),
            monthlyAvg: document.getElementById('monthlyAvg'),
            currentMonthName: document.getElementById('currentMonthName'),
            currentCalendar: document.getElementById('currentCalendar'),
            currentMonthTotal: document.getElementById('currentMonthTotal'),
            previousMonths: document.getElementById('previousMonths'),
            addTimeBtn: document.getElementById('addTimeBtn'),
            addTimeModal: document.getElementById('addTimeModal'),
            hoursInput: document.getElementById('hoursInput'),
            modalCalendar: document.getElementById('modalCalendar'),
            selectedDay: document.getElementById('selectedDay'),
            confirmAdd: document.getElementById('confirmAdd'),
            cancelAdd: document.getElementById('cancelAdd'),
            closeAddModal: document.getElementById('closeAddModal'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            goalInput: document.getElementById('goalInput'),
            saveSettings: document.getElementById('saveSettings'),
            cancelSettings: document.getElementById('cancelSettings'),
            closeSettingsModal: document.getElementById('closeSettingsModal'),
            clearDataBtn: document.getElementById('clearDataBtn')
        };
    }

    bindEvents() {
        // Add time modal
        this.elements.addTimeBtn.addEventListener('click', () => this.openAddModal());
        this.elements.closeAddModal.addEventListener('click', () => this.closeAddModal());
        this.elements.cancelAdd.addEventListener('click', () => this.closeAddModal());
        this.elements.confirmAdd.addEventListener('click', () => this.handleAddHours());
        
        // Settings modal
        this.elements.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        this.elements.closeSettingsModal.addEventListener('click', () => this.closeSettingsModal());
        this.elements.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        this.elements.saveSettings.addEventListener('click', () => this.handleSaveSettings());
        this.elements.clearDataBtn.addEventListener('click', () => this.handleClearData());
        
        // Close modals on overlay click
        this.elements.addTimeModal.addEventListener('click', (e) => {
            if (e.target === this.elements.addTimeModal) this.closeAddModal();
        });
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) this.closeSettingsModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddModal();
                this.closeSettingsModal();
            }
        });
    }

    // ===== Rendering =====
    render() {
        this.renderHeader();
        this.renderStats();
        this.renderCurrentMonth();
        this.renderPreviousMonths();
    }

    renderHeader() {
        this.elements.yearLabel.textContent = this.getAcademicYearLabel();
    }

    renderStats() {
        const total = this.getYearTotal();
        const goal = this.data.goal;
        const percentage = Math.min((total / goal) * 100, 100);
        const avgNeeded = this.getMonthlyAverageNeeded();
        
        this.elements.totalHours.textContent = total.toFixed(1).replace(/\.0$/, '');
        this.elements.goalHours.textContent = goal;
        this.elements.monthlyAvg.textContent = avgNeeded;
        
        // Update progress ring
        this.elements.progressRing.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }

    renderCurrentMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = this.currentDate.getDate();
        
        const monthName = new Date(year, month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        this.elements.currentMonthName.textContent = monthName;
        this.elements.currentCalendar.innerHTML = this.generateCalendarHTML(year, month, today);
        
        const monthTotal = this.getMonthTotal(year, month);
        this.elements.currentMonthTotal.textContent = `${monthTotal.toFixed(1).replace(/\.0$/, '')} hrs`;
    }

    generateCalendarHTML(year, month, highlightDay = null) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = isCurrentMonth ? today.getDate() : null;
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = '';
        
        // Day headers
        for (const day of dayNames) {
            html += `<div class="calendar-day-header">${day}</div>`;
        }
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const hours = this.getHoursForDay(year, month, d);
            const hasHours = hours > 0;
            const isToday = d === todayDate;
            
            let classes = 'calendar-day';
            if (hasHours) classes += ' has-hours';
            if (isToday) classes += ' today';
            
            html += `
                <div class="${classes}">
                    <span class="day-number">${d}</span>
                    ${hasHours ? `<span class="day-hours">${hours}h</span>` : ''}
                </div>
            `;
        }
        
        return html;
    }

    renderPreviousMonths() {
        const previousMonths = this.getPreviousMonths();
        
        if (previousMonths.length === 0) {
            this.elements.previousMonths.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No previous months in this academic year yet.</p>';
            return;
        }
        
        let html = '';
        
        for (const m of previousMonths) {
            const monthName = new Date(m.year, m.month).toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
            });
            const total = this.getMonthTotal(m.year, m.month);
            const hasHours = total > 0;
            
            html += `
                <div class="month-item" data-year="${m.year}" data-month="${m.month}">
                    <div class="month-item-header">
                        <span class="month-item-name">${monthName}</span>
                        <span class="month-item-hours ${hasHours ? 'has-hours' : ''}">${total.toFixed(1).replace(/\.0$/, '')} hrs</span>
                        <span class="month-item-expand">▼</span>
                    </div>
                    <div class="month-item-calendar">
                        <div class="calendar">
                            ${this.generateCalendarHTML(m.year, m.month)}
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.elements.previousMonths.innerHTML = html;
        
        // Add click handlers for expanding
        const monthItems = this.elements.previousMonths.querySelectorAll('.month-item-header');
        monthItems.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.month-item');
                item.classList.toggle('expanded');
            });
        });
    }

    // ===== Modal Handlers =====
    openAddModal() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = this.currentDate.getDate();
        
        // Render modal calendar
        this.elements.modalCalendar.innerHTML = this.generateModalCalendarHTML(year, month, today);
        this.elements.selectedDay.value = today;
        
        // Add click handlers to calendar days
        const dayElements = this.elements.modalCalendar.querySelectorAll('.calendar-day:not(.empty)');
        dayElements.forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                // Remove selected class from all days
                this.elements.modalCalendar.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('selected');
                });
                // Add selected class to clicked day
                dayEl.classList.add('selected');
                // Update hidden input
                this.elements.selectedDay.value = dayEl.dataset.day;
            });
        });
        
        // Reset hours input
        this.elements.hoursInput.value = '';
        
        // Show modal
        this.elements.addTimeModal.classList.add('active');
        this.elements.hoursInput.focus();
    }

    generateModalCalendarHTML(year, month, selectedDay) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = isCurrentMonth ? today.getDate() : null;
        
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        let html = '';
        
        // Day headers
        for (const day of dayNames) {
            html += `<div class="calendar-day-header">${day}</div>`;
        }
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const hours = this.getHoursForDay(year, month, d);
            const hasHours = hours > 0;
            const isToday = d === todayDate;
            const isSelected = d === selectedDay;
            
            let classes = 'calendar-day';
            if (hasHours) classes += ' has-hours';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            html += `<div class="${classes}" data-day="${d}">${d}</div>`;
        }
        
        return html;
    }

    closeAddModal() {
        this.elements.addTimeModal.classList.remove('active');
    }

    handleAddHours() {
        const hours = parseFloat(this.elements.hoursInput.value);
        const day = parseInt(this.elements.selectedDay.value);
        
        if (isNaN(hours) || hours <= 0) {
            this.elements.hoursInput.focus();
            return;
        }
        
        if (isNaN(day) || day <= 0) {
            return;
        }
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.addHoursForDay(year, month, day, hours);
        this.closeAddModal();
        this.render();
    }

    openSettingsModal() {
        this.elements.goalInput.value = this.data.goal;
        this.elements.settingsModal.classList.add('active');
        this.elements.goalInput.focus();
    }

    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('active');
    }

    handleSaveSettings() {
        const goal = parseInt(this.elements.goalInput.value);
        
        if (isNaN(goal) || goal <= 0) {
            this.elements.goalInput.focus();
            return;
        }
        
        this.data.goal = goal;
        this.saveData();
        this.closeSettingsModal();
        this.render();
    }

    handleClearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.data = { goal: 600, hours: {} };
            this.saveData();
            this.closeSettingsModal();
            this.render();
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cadenceApp = new CadenceApp();
});

