import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const legend = d3.select('.legend');
const searchInput = document.querySelector('.searchBar');

if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

renderProjects(projects, projectsContainer, 'h2');

let query = '';
let selectedYear = null;

function getFilteredProjects() {
    let filtered = projects.filter(project =>
        Object.values(project).join('\n').toLowerCase().includes(query)
    );

    if (selectedYear) {
        filtered = filtered.filter(p => p.year === selectedYear);
    }

    return filtered;
}

let data = [];

function renderPieChart(projectsGiven) {
    const rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    data = rolledData.map(([year, count]) => ({ value: count, label: year }));
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const sliceGenerator = d3.pie().value((d) => d.value);
    const arcData = sliceGenerator(data);

    const svg = d3.select('svg');
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    arcData.forEach((d, i) => {
        const arc = d3.arc().innerRadius(0).outerRadius(50);

        svg.append('path')
            .attr('d', arc(d))
            .attr('fill', colors(i))
            .attr('class', d.data.label === selectedYear ? 'selected' : '')
            .on('click', (event) => {
                event.stopPropagation();
                selectedYear = selectedYear === d.data.label ? null : d.data.label;
                updateDisplay();
            });
    });

    data.forEach((d, i) => {
        legend.append('li')
            .attr('style', `--color:${colors(i)}`)
            .attr('class', d.label === selectedYear ? 'selected legend-item' : 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

function updateDisplay() {
    const filteredProjects = getFilteredProjects();
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    updateDisplay();
});