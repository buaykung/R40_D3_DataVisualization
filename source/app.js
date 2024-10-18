const data = [10, 30, 50, 20, 40];

      const width = 600;
      const height = 400;

      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 50)
        .attr("y", d => height - d * 4)
        .attr("width", 40)
        .attr("height", d => d * 4)
        .attr("fill", "#4c66af");