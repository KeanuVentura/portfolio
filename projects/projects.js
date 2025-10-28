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
let selectedIndex = -1;

function getFilteredProjects() {
    let filtered = projects.filter(project =>
        Object.values(project).join('\n').toLowerCase().includes(query)
    );

    if (selectedIndex !== -1 && data[selectedIndex]) {
        const selectedLabel = data[selectedIndex].label;
        filtered = filtered.filter(p => p.year === selectedLabel);
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
    const arcs = arcData.map((d) => d3.arc().innerRadius(0).outerRadius(50)(d));

    const svg = d3.select('svg');
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    arcs.forEach((arc, i) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .attr('class', selectedIndex === i ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;
                updateDisplay();
            });
    });

    data.forEach((d, i) => {
        legend.append('li')
            .attr('style', `--color:${colors(i)}`)
            .attr('class', selectedIndex === i ? 'selected legend-item' : 'legend-item')
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
