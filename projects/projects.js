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

let query = '';
let selectedIndex = -1;

renderProjects(projects, projectsContainer, 'h2');

function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => d3.arc().innerRadius(0).outerRadius(50)(d));

    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    arcs.forEach((arc, i) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .attr('class', selectedIndex === i ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;

                svg.selectAll('path')
                    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

                legend.selectAll('li')
                    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected legend-item' : 'legend-item'));

                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');
                } else {
                    let selectedLabel = data[selectedIndex].label;
                    let filteredProjects = projects.filter(p => p.year === selectedLabel);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                }
            });
    });

    data.forEach((d, i) => {
        legend.append('li')
            .attr('style', `--color:${colors(i)}`)
            .attr('class', selectedIndex === i ? 'selected legend-item' : 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    let filteredProjects = projects.filter(project =>
        Object.values(project).join('\n').toLowerCase().includes(query)
    );

    selectedIndex = -1;

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
