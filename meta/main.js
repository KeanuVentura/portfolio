import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
}
function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
            value: lines,
            configurable: false,
            writable: false,
            enumerable: true 
        });
  
        return ret;
      });
}
function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('id', 'website-stats');
  
    dl.append('dt').text('Commits:');
    dl.append('dd').text(commits.length);

    const files = new Set(data.map(d => d.file));
    dl.append('dt').text('Files:');
    dl.append('dd').text(files.size);

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>:');
    dl.append('dd').text(data.length);

    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max Depth:');
    dl.append('dd').text(maxDepth);

    const longestLine = d3.max(data, d => d.length);
    dl.append('dt').text('Longest Line:');
    dl.append('dd').text(longestLine);

    const maxLinesPerCommit = d3.max(commits, d => d.totalLines);
    dl.append('dt').text('Max Lines:');
    dl.append('dd').text(maxLinesPerCommit);
  }
let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);