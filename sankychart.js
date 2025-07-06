function createSankyChart(data){
    // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;
  const format = d3.format(",.0f");

  // Function to generate unique IDs
  function generateUid(prefix = "id") {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create a SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Constructs and configures a Sankey generator.
  const sankey = d3.sankey()
      .nodeId(d => d.name)
      .nodeAlign(d3.sankeyJustify) // d3.sankeyLeft, etc.
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 5], [width - 1, height - 5]]);

  // Applies it to the data. We make a copy of the nodes and links objects
  // so as to avoid mutating the original.
  const {nodes, links} = sankey({
    nodes: data.nodes.map(d => Object.assign({}, d)),
    links: data.links.map(d => Object.assign({}, d))
  });

  // Defines a color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Creates the rects that represent the nodes.
  const rect = svg.append("g")
      .attr("stroke", "#000")
    .selectAll()
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => color(d.category));

  // Adds a title on the nodes.
  rect.append("title")
      .text(d => `${d.name}\n${format(d.value)} TWh`);

  // Creates the paths that represent the links.
  const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
    .selectAll()
    .data(links)
    .join("g")
      .style("mix-blend-mode", "multiply");

  // Creates a gradient, if necessary, for the source-target color option.
  const linkColor = "source-target"; // Choose "source", "target", "source-target", or a specific color
  if (linkColor === "source-target") {
    const gradient = link.append("linearGradient")
        .attr("id", d => (d.uid = generateUid("link")))
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0);
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => color(d.source.category));
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => color(d.target.category));
  }

  link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", linkColor === "source-target" ? (d) => `url(#${d.uid})`
          : linkColor === "source" ? (d) => color(d.source.category)
          : linkColor === "target" ? (d) => color(d.target.category) 
          : linkColor)
      .attr("stroke-width", d => Math.max(1, d.width));

  link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)} TWh`);

  // Adds labels on the nodes.
  svg.append("g")
    .selectAll()
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name);

  document.getElementById("sankychart").appendChild(svg.node());

}
async function loadDataAndCreateChart(){
    // const links = await FileAttachment("data/energy.csv").csv({typed: true});
    // const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({name, category: name.replace(/ .*/, "")}));
    // createSankyChart({nodes, links});
    try {
        // Load the CSV file with D3's csv function
        const links = await d3.csv("data/energy.csv", d3.autoType);

        // Generate nodes by finding unique sources and targets
        const nodes = Array.from(
            new Set(links.flatMap(l => [l.source, l.target])),
            name => ({ name, category: name.replace(/ .*/, "") })
        );

        // Call the function to create the Sankey chart with the data
        createSankyChart({ nodes, links });
    } catch (error) {
        console.error("Error loading or processing data:", error);
    }
};

loadDataAndCreateChart();