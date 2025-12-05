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
            const data = JSON.parse(stored);
            // Migrate old format (just hours) to new format (hours + credit)
            if (data.hours) {
                for (const key in data.hours) {
                    if (typeof data.hours[key] === 'number') {
                        data.hours[key] = { hours: data.hours[key], credit: 0 };
                    }
                }
            }
            return data;
        }
        return {
            goal: 600,
            hours: {} // Format: { "2024-09-15": { hours: 3.5, credit: 1 }, ... }
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

    // Get all months for a specific academic year
    getMonthsForAcademicYear(startYear) {
        const months = [];
        // September (8) to December (11) of start year
        for (let m = 8; m <= 11; m++) {
            months.push({ year: startYear, month: m });
        }
        // January (0) to August (7) of end year
        for (let m = 0; m <= 7; m++) {
            months.push({ year: startYear + 1, month: m });
        }
        return months;
    }

    // Get previous academic years (completed years)
    getPreviousYears() {
        const currentAcademicYear = this.getAcademicYear();
        const previousYears = [];
        
        // Look for years with data going back
        // Check up to 10 years back for any data
        for (let startYear = currentAcademicYear.start - 1; startYear >= currentAcademicYear.start - 10; startYear--) {
            const yearTotal = this.getYearTotalForAcademicYear(startYear);
            if (yearTotal.total > 0) {
                previousYears.push({
                    startYear,
                    endYear: startYear + 1,
                    label: `${startYear}–${(startYear + 1).toString().slice(-2)}`,
                    ...yearTotal
                });
            }
        }
        
        return previousYears;
    }

    // Get total hours/credit for a specific academic year
    getYearTotalForAcademicYear(startYear) {
        const months = this.getMonthsForAcademicYear(startYear);
        let hours = 0;
        let credit = 0;
        
        for (const m of months) {
            const monthTotals = this.getMonthTotals(m.year, m.month);
            hours += monthTotals.hours;
            credit += monthTotals.credit;
        }
        
        return { hours, credit, total: hours + credit };
    }

    // ===== Hours & Credit Calculation =====
    getDayData(year, month, day) {
        const key = this.formatDateKey(year, month, day);
        return this.data.hours[key] || { hours: 0, credit: 0 };
    }

    getDayTotal(year, month, day) {
        const data = this.getDayData(year, month, day);
        return data.hours + data.credit;
    }

    setDayData(year, month, day, hours, credit) {
        const key = this.formatDateKey(year, month, day);
        if (hours > 0 || credit > 0) {
            this.data.hours[key] = { hours, credit };
        } else {
            delete this.data.hours[key];
        }
        this.saveData();
    }

    addDayData(year, month, day, hours, credit) {
        const current = this.getDayData(year, month, day);
        this.setDayData(year, month, day, current.hours + hours, current.credit + credit);
    }

    formatDateKey(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    getMonthTotals(year, month) {
        let hours = 0;
        let credit = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dayData = this.getDayData(year, month, d);
            hours += dayData.hours;
            credit += dayData.credit;
        }
        
        return { hours, credit, total: hours + credit };
    }

    getYearTotal() {
        const months = this.getAcademicYearMonths();
        let total = 0;
        
        for (const m of months) {
            const monthTotals = this.getMonthTotals(m.year, m.month);
            total += monthTotals.total;
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
            currentMonthHours: document.getElementById('currentMonthHours'),
            currentMonthCredit: document.getElementById('currentMonthCredit'),
            currentMonthTotal: document.getElementById('currentMonthTotal'),
            previousMonths: document.getElementById('previousMonths'),
            previousYearsSection: document.getElementById('previousYearsSection'),
            previousYears: document.getElementById('previousYears'),
            addTimeBtn: document.getElementById('addTimeBtn'),
            addTimeModal: document.getElementById('addTimeModal'),
            addModalTitle: document.getElementById('addModalTitle'),
            hoursInput: document.getElementById('hoursInput'),
            creditInput: document.getElementById('creditInput'),
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
            clearDataBtn: document.getElementById('clearDataBtn'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            importDataBtn: document.getElementById('importDataBtn'),
            importFileInput: document.getElementById('importFileInput')
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
        this.elements.exportDataBtn.addEventListener('click', () => this.handleExportData());
        this.elements.importDataBtn.addEventListener('click', () => this.elements.importFileInput.click());
        this.elements.importFileInput.addEventListener('change', (e) => this.handleImportData(e));
        
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
        this.renderPreviousYears();
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
        
        // Add click handlers to calendar days for editing
        const dayElements = this.elements.currentCalendar.querySelectorAll('.calendar-day:not(.empty)');
        dayElements.forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const day = parseInt(dayEl.querySelector('.day-number').textContent);
                this.openAddModal(day);
            });
        });
        
        const totals = this.getMonthTotals(year, month);
        this.elements.currentMonthHours.textContent = this.formatNumber(totals.hours);
        this.elements.currentMonthCredit.textContent = this.formatNumber(totals.credit);
        this.elements.currentMonthTotal.textContent = this.formatNumber(totals.total);
    }

    formatNumber(num) {
        return num.toFixed(1).replace(/\.0$/, '');
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
            const dayTotal = this.getDayTotal(year, month, d);
            const hasHours = dayTotal > 0;
            const isToday = d === todayDate;
            
            let classes = 'calendar-day';
            if (hasHours) classes += ' has-hours';
            if (isToday) classes += ' today';
            
            html += `
                <div class="${classes}">
                    <span class="day-number">${d}</span>
                    ${hasHours ? `<span class="day-hours">${this.formatNumber(dayTotal)}h</span>` : ''}
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
            const totals = this.getMonthTotals(m.year, m.month);
            const hasHours = totals.total > 0;
            
            html += `
                <div class="month-item" data-year="${m.year}" data-month="${m.month}">
                    <div class="month-item-header">
                        <span class="month-item-name">${monthName}</span>
                        <span class="month-item-hours ${hasHours ? 'has-hours' : ''}">${this.formatNumber(totals.total)} hrs</span>
                        <span class="month-item-expand">▼</span>
                    </div>
                    <div class="month-item-calendar">
                        <div class="calendar">
                            ${this.generateCalendarHTML(m.year, m.month)}
                        </div>
                        <div class="month-totals">
                            <div class="month-total-row">
                                <span>Hours</span>
                                <span>${this.formatNumber(totals.hours)}</span>
                            </div>
                            <div class="month-total-row">
                                <span>Credit</span>
                                <span>${this.formatNumber(totals.credit)}</span>
                            </div>
                            <div class="month-total-row total">
                                <span>Total</span>
                                <span>${this.formatNumber(totals.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.elements.previousMonths.innerHTML = html;
        
        // Add click handlers for expanding and day editing
        const monthItems = this.elements.previousMonths.querySelectorAll('.month-item');
        monthItems.forEach(item => {
            const header = item.querySelector('.month-item-header');
            const year = parseInt(item.dataset.year);
            const month = parseInt(item.dataset.month);
            
            // Toggle expand on header click
            header.addEventListener('click', () => {
                item.classList.toggle('expanded');
            });
            
            // Add click handlers to calendar days for editing
            const dayElements = item.querySelectorAll('.calendar-day:not(.empty)');
            dayElements.forEach(dayEl => {
                dayEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering header click
                    const day = parseInt(dayEl.querySelector('.day-number').textContent);
                    this.openAddModal(day, year, month);
                });
            });
        });
    }

    renderPreviousYears() {
        const previousYears = this.getPreviousYears();
        
        // Hide section if no previous years
        if (previousYears.length === 0) {
            this.elements.previousYearsSection.style.display = 'none';
            return;
        }
        
        this.elements.previousYearsSection.style.display = 'block';
        
        let html = '';
        
        for (const year of previousYears) {
            const months = this.getMonthsForAcademicYear(year.startYear);
            
            let monthsHtml = '';
            for (const m of months) {
                const monthName = new Date(m.year, m.month).toLocaleDateString('en-US', { 
                    month: 'long',
                    year: 'numeric'
                });
                const totals = this.getMonthTotals(m.year, m.month);
                const hasHours = totals.total > 0;
                
                monthsHtml += `
                    <div class="year-month-item month-item" data-year="${m.year}" data-month="${m.month}">
                        <div class="month-item-header">
                            <span class="month-item-name">${monthName}</span>
                            <span class="month-item-hours ${hasHours ? 'has-hours' : ''}">${this.formatNumber(totals.total)} hrs</span>
                            <span class="month-item-expand">▼</span>
                        </div>
                        <div class="month-item-calendar">
                            <div class="calendar">
                                ${this.generateCalendarHTML(m.year, m.month)}
                            </div>
                            <div class="month-totals">
                                <div class="month-total-row">
                                    <span>Hours</span>
                                    <span>${this.formatNumber(totals.hours)}</span>
                                </div>
                                <div class="month-total-row">
                                    <span>Credit</span>
                                    <span>${this.formatNumber(totals.credit)}</span>
                                </div>
                                <div class="month-total-row total">
                                    <span>Total</span>
                                    <span>${this.formatNumber(totals.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += `
                <div class="year-item" data-start-year="${year.startYear}">
                    <div class="year-item-header">
                        <span class="year-item-name">${year.label}</span>
                        <span class="year-item-hours ${year.total > 0 ? 'has-hours' : ''}">${this.formatNumber(year.total)} hrs</span>
                        <span class="year-item-expand">▼</span>
                    </div>
                    <div class="year-item-content">
                        <div class="year-months-list">
                            ${monthsHtml}
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.elements.previousYears.innerHTML = html;
        
        // Add click handlers for year expansion
        const yearItems = this.elements.previousYears.querySelectorAll('.year-item');
        yearItems.forEach(yearItem => {
            const yearHeader = yearItem.querySelector('.year-item-header');
            
            yearHeader.addEventListener('click', () => {
                yearItem.classList.toggle('expanded');
            });
            
            // Add click handlers for month expansion within years
            const monthItems = yearItem.querySelectorAll('.year-month-item');
            monthItems.forEach(monthItem => {
                const monthHeader = monthItem.querySelector('.month-item-header');
                const year = parseInt(monthItem.dataset.year);
                const month = parseInt(monthItem.dataset.month);
                
                monthHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    monthItem.classList.toggle('expanded');
                });
                
                // Add click handlers to calendar days for editing
                const dayElements = monthItem.querySelectorAll('.calendar-day:not(.empty)');
                dayElements.forEach(dayEl => {
                    dayEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const day = parseInt(dayEl.querySelector('.day-number').textContent);
                        this.openAddModal(day, year, month);
                    });
                });
            });
        });
    }

    // ===== Modal Handlers =====
    openAddModal(selectedDay = null, targetYear = null, targetMonth = null) {
        // Use provided year/month or default to current
        const year = targetYear !== null ? targetYear : this.currentDate.getFullYear();
        const month = targetMonth !== null ? targetMonth : this.currentDate.getMonth();
        
        // Store the target year/month for saving
        this.modalTargetYear = year;
        this.modalTargetMonth = month;
        
        // Determine which day to select
        const today = this.currentDate.getDate();
        const isCurrentMonth = year === this.currentDate.getFullYear() && month === this.currentDate.getMonth();
        const dayToSelect = selectedDay || (isCurrentMonth ? today : 1);
        
        // Render modal calendar
        this.elements.modalCalendar.innerHTML = this.generateModalCalendarHTML(year, month, dayToSelect);
        this.elements.selectedDay.value = dayToSelect;
        
        // Pre-fill with existing data for selected day
        this.updateModalInputsForDay(year, month, dayToSelect);
        
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
                const day = parseInt(dayEl.dataset.day);
                this.elements.selectedDay.value = day;
                // Update inputs with this day's data
                this.updateModalInputsForDay(year, month, day);
            });
        });
        
        // Show modal
        this.elements.addTimeModal.classList.add('active');
        this.elements.hoursInput.focus();
    }

    updateModalInputsForDay(year, month, day) {
        const dayData = this.getDayData(year, month, day);
        const hasData = dayData.hours > 0 || dayData.credit > 0;
        
        this.elements.hoursInput.value = dayData.hours > 0 ? dayData.hours : '';
        this.elements.creditInput.value = dayData.credit > 0 ? dayData.credit : '';
        
        // Update modal title based on whether we're editing or adding
        this.elements.addModalTitle.textContent = hasData ? 'Edit Day' : 'Add Hours';
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
            const dayTotal = this.getDayTotal(year, month, d);
            const hasHours = dayTotal > 0;
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
        const hours = parseFloat(this.elements.hoursInput.value) || 0;
        const credit = parseFloat(this.elements.creditInput.value) || 0;
        const day = parseInt(this.elements.selectedDay.value);
        
        if (isNaN(day) || day <= 0) {
            return;
        }
        
        // Use the stored target year/month from when modal was opened
        const year = this.modalTargetYear;
        const month = this.modalTargetMonth;
        
        // Set (replace) the values for this day
        this.setDayData(year, month, day, hours, credit);
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

    handleExportData() {
        const exportData = {
            version: 1,
            exportDate: new Date().toISOString(),
            data: this.data
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cadence-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleImportData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate the imported data structure
                if (!importedData.data || typeof importedData.data.goal !== 'number') {
                    throw new Error('Invalid backup file format');
                }
                
                if (confirm('This will replace all current data with the imported backup. Continue?')) {
                    this.data = importedData.data;
                    
                    // Ensure data structure is correct (migrate if needed)
                    if (this.data.hours) {
                        for (const key in this.data.hours) {
                            if (typeof this.data.hours[key] === 'number') {
                                this.data.hours[key] = { hours: this.data.hours[key], credit: 0 };
                            }
                        }
                    }
                    
                    this.saveData();
                    this.closeSettingsModal();
                    this.render();
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
        
        // Reset the file input so the same file can be selected again
        event.target.value = '';
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cadenceApp = new CadenceApp();
});

