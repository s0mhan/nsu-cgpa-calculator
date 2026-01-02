document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const semestersContainer = document.getElementById('semesters-container');
    const addSemesterBtn = document.getElementById('add-semester-btn');
    const resetBtn = document.getElementById('reset-btn');
    const semesterTemplate = document.getElementById('semester-template');
    const courseTemplate = document.getElementById('course-template');
    const previousCgpaInput = document.getElementById('previous-cgpa');
    const previousCreditsInput = document.getElementById('previous-credits');
    const finalCgpaEl = document.getElementById('final-cgpa');
    const totalCreditsEl = document.getElementById('total-credits-completed');

    let semesterCounter = 0;

    // --- Core Functions ---

    /**
     * Calculates Semester GPA and Overall CGPA and updates the UI.
     */
    const calculateAll = () => {
        let totalQualityPoints = 0;
        let totalCredits = 0;

        // 1. Account for previous CGPA and credits
        const prevCgpa = parseFloat(previousCgpaInput.value) || 0;
        const prevCredits = parseFloat(previousCreditsInput.value) || 0;

        if (prevCgpa > 0 && prevCredits > 0) {
            totalQualityPoints += prevCgpa * prevCredits;
            totalCredits += prevCredits;
        }

        // 2. Iterate through each semester card
        document.querySelectorAll('.semester-card').forEach(semesterCard => {
            let semesterQualityPoints = 0;
            let semesterCredits = 0;
            let semesterGpa = 0;

            const mode = semesterCard.querySelector('.mode-switch:checked').value;

            if (mode === 'course') {
                // 3a. Iterate through each course in the semester
                semesterCard.querySelectorAll('.course-row').forEach(courseRow => {
                    const credit = parseFloat(courseRow.querySelector('.credit-input').value) || 0;
                    const gradePoint = parseFloat(courseRow.querySelector('.grade-select').value) || 0;

                    if (credit > 0 && gradePoint >= 0) {
                        semesterQualityPoints += credit * gradePoint;
                        semesterCredits += credit;
                    }
                });
                semesterGpa = semesterCredits > 0 ? (semesterQualityPoints / semesterCredits) : 0;
            } else { // mode === 'summary'
                // 3b. Read from summary inputs
                const summaryGpa = parseFloat(semesterCard.querySelector('.semester-gpa-input').value) || 0;
                const summaryCredits = parseFloat(semesterCard.querySelector('.semester-credits-input').value) || 0;

                if (summaryGpa > 0 && summaryCredits > 0) {
                    semesterCredits = summaryCredits;
                    semesterQualityPoints = summaryGpa * summaryCredits;
                    semesterGpa = summaryGpa;
                }
            }


            // 4. Display Semester GPA
            semesterCard.querySelector('.semester-gpa').textContent = semesterGpa.toFixed(2);

            // 5. Add semester totals to overall totals
            totalQualityPoints += semesterQualityPoints;
            totalCredits += semesterCredits;
        });

        // 6. Calculate and display Final CGPA
        const finalCgpa = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;
        finalCgpaEl.textContent = finalCgpa.toFixed(2);
        totalCreditsEl.textContent = `Total Credits: ${totalCredits}`;
    };

    /**
     * Updates the semester titles to be sequential.
     */
    const updateSemesterNumbers = () => {
        const semesterCards = document.querySelectorAll('.semester-card');
        semesterCards.forEach((card, index) => {
            card.querySelector('.semester-title').textContent = `Semester ${index + 1}`;
        });
    };

    /**
     * Adds a new course to a semester.
     * @param {HTMLElement} coursesContainer - The container to add the course to.
     */
    const addCourse = (coursesContainer) => {
        const courseFragment = courseTemplate.content.cloneNode(true);
        coursesContainer.appendChild(courseFragment);
    };
    
    /**
     * Adds a new semester to the page.
     */
    const addSemester = () => {
        semesterCounter++;
        const semesterFragment = semesterTemplate.content.cloneNode(true);
        
        // Make radio buttons unique for the new semester
        const modeSwitches = semesterFragment.querySelectorAll('.mode-switch');
        modeSwitches.forEach(switchEl => {
            const label = switchEl.nextElementSibling;
            const newId = `${switchEl.value}-sem-${semesterCounter}`;
            switchEl.name = `mode-sem-${semesterCounter}`;
            switchEl.id = newId;
            label.setAttribute('for', newId);
        });

        const coursesContainer = semesterFragment.querySelector('.courses-container');
        addCourse(coursesContainer); // Add a default course to the new semester
        semestersContainer.appendChild(semesterFragment);
        updateSemesterNumbers();
    };

    /**
     * Resets the entire calculator to its initial state.
     */
    const resetAll = () => {
        semesterCounter = 0;
        previousCgpaInput.value = '';
        previousCreditsInput.value = '';
        semestersContainer.innerHTML = '';
        addSemester();
        calculateAll();
    };


    // --- Event Listeners ---

    // Add Semester button
    addSemesterBtn.addEventListener('click', () => {
        addSemester();
        calculateAll();
    });

    // Reset All button
    resetBtn.addEventListener('click', resetAll);

    // Listener for previous CGPA/Credits input
    [previousCgpaInput, previousCreditsInput].forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // Delegated listeners for dynamic elements (semesters and courses)
    semestersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-course-btn')) {
            const coursesContainer = e.target.closest('.course-mode-content').querySelector('.courses-container');
            addCourse(coursesContainer);
        }
        
        if (e.target.classList.contains('remove-course-btn')) {
            e.target.closest('.course-row').remove();
            calculateAll();
        }
        
        if (e.target.classList.contains('remove-semester-btn')) {
            e.target.closest('.semester-card').remove();
            updateSemesterNumbers();
            calculateAll();
        }
    });

    semestersContainer.addEventListener('input', (e) => {
        // Recalculate on any input change within the semesters container
        const targetClassList = e.target.classList;
        if (targetClassList.contains('credit-input') || 
            targetClassList.contains('grade-select') ||
            targetClassList.contains('semester-gpa-input') ||
            targetClassList.contains('semester-credits-input')) {
            calculateAll();
        }
    });

    semestersContainer.addEventListener('change', e => {
        if (e.target.classList.contains('mode-switch')) {
            const semesterBody = e.target.closest('.card-body');
            const courseContent = semesterBody.querySelector('.course-mode-content');
            const summaryContent = semesterBody.querySelector('.summary-mode-content');

            if (e.target.value === 'course') {
                courseContent.style.display = 'block';
                summaryContent.style.display = 'none';
            } else {
                courseContent.style.display = 'none';
                summaryContent.style.display = 'block';
            }
            calculateAll();
        }
    });

    // --- Initial State ---
    resetAll(); // Reset to ensure clean start
});
