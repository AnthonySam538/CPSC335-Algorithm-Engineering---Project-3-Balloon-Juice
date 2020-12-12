/* Author: Anthony Sam (anthonysam538@csu.fullerton.edu)
This is the javascript file. This file contains the programming for the 
p5.js canvas. It contains the logic for the bot, the adjacency list, and 
the adjacency matrix. The bulk of the programming is in this file. */

function setup() // p5.js setup function | This will be called once and only once
{
    grid = { width: 144, height: 144, cell_size: 10 };
    createCanvas(grid.width * grid.cell_size, grid.height * grid.cell_size);

    current_balloon = { dark: "00", pale: "13", veined: "06" };
    balloons = [current_balloon.dark + current_balloon.pale + current_balloon.veined]; // balloons that exist in the graph
    explored_balloons = []; // balloons that exist in the graph, and we know their exits
    destination = "031303";

    // Create the adjacency list on the left side of the canvas (displays explored_balloons)
    fill(255);
    textAlign(LEFT, TOP);
    textSize(grid.cell_size);
    text("Visited balloons and their exits:", 0, 30 * grid.cell_size);

    // Create the adjacency matrix to the right of the adjacency list (displays balloons)
    balloon_graph = [];
    balloon_graph[0] = [0];
    textAlign(RIGHT, TOP);
    text(current_balloon.dark + ' ' + current_balloon.pale + ' ' + current_balloon.veined, 42 * grid.cell_size, 34 * grid.cell_size);
    push();
    translate(43 * grid.cell_size, 33 * grid.cell_size);
    rotate(-HALF_PI);
    textAlign(LEFT, TOP);
    text(current_balloon.dark + ' ' + current_balloon.pale + ' ' + current_balloon.veined, 0, 0);
    pop();

    textAlign(CENTER, TOP);
    textSize(4 * grid.cell_size);
    text("Current balloon:", width / 2, 0);

    textSize(3 * grid.cell_size);
    text("Possible exits:", width / 2, 12 * grid.cell_size);

    frameRate(0.5);
}

function draw() // p5.js draw function | This will be called repeatedly
{
    // Erase the current current_balloon
    fill(0);
    rect(0, 4 * grid.cell_size, width, 8 * grid.cell_size);

    // Display the current_balloon
    fill(255);
    textSize(8 * grid.cell_size);
    text('(' + current_balloon.dark + ' ' + current_balloon.pale + ' ' + current_balloon.veined + ')', width / 2, 4 * grid.cell_size);

    if (current_balloon.dark + current_balloon.pale + current_balloon.veined == destination)
    {
        // If we have finally reached the mystic balloon, then start heading back to base
        if (destination == "031303")
        {
            push();
            textAlign(LEFT, TOP);
            textSize(2 * grid.cell_size);
            text("We have found the balloon juice!", 0, 0);
            pop();
            destination = "001306";
        }
        // If we have headed back to base with balloon juice in tow, than terminate the program
        else // if(destination == "001306")
        {
            push();
            textAlign(LEFT, TOP);
            textSize(2 * grid.cell_size);
            text("Balloon juice delivered to base.", 0, 2 * grid.cell_size);
            pop();
            noLoop();
            destination = ""; // the bot is now free to wander at its leisure as it explores the rest of the balloons
        }
    }

    // Erase the current possible exits
    fill(0);
    rect(0, 15 * grid.cell_size, width, 14 * grid.cell_size);

    // Display the current possible exits
    exits = determineExits(Number(current_balloon.dark), Number(current_balloon.pale), Number(current_balloon.veined));
    fill(255);
    textSize(6 * grid.cell_size);
    text(exits, width / 2, 15 * grid.cell_size);

    /* Determine the next exit. The way this is done is by looking at all 
    of the possible exits. If one of the possible exits is our 
    destination, then that will be our next exit, end of story. If none of 
    the possible exits are our destination, then try to prioritize 
    balloons that we've not explored yet. If all of the balloons have been 
    explored, then just simply choose a random exit. */
    next_exit = Math.floor((exits.length + 1) / 11 * Math.random());

    for (let index = 1; index < exits.length; index += 11)
    {
        let current_exit_balloon = exits.substring(index, index + 2) + exits.substring(index + 3, index + 5) + exits.substring(index + 6, index + 8);

        if (current_exit_balloon == destination)
        {
            next_exit = Math.floor(index / 11);
            break;
        }
        else if (!explored_balloons.includes(current_exit_balloon))
            next_exit = Math.floor(index / 11);
    }

    current_balloon.dark = exits.substring(11 * next_exit + 1, 11 * next_exit + 3);
    current_balloon.pale = exits.substring(11 * next_exit + 4, 11 * next_exit + 6);
    current_balloon.veined = exits.substring(11 * next_exit + 7, 11 * next_exit + 9);
}

/* This function ended up doing way more than I thought it would. So 
first, it determines all possible exits, given a starting balloon. Second, 
we update the adjacency list, if necessary. Third, we update specific 
values in the adjacency matrix. Fourth, we update all values in the 
adjacency matrix using Warshall-Floyd's algorithm. Fifth, we prepare the 
output string. */
function determineExits(dark, pale, veined)
{
    /* In this section of the function, we are trying to find all possible 
    exits. To go more into detail, the way this is done is by first 
    checking the dark cord and seeing if it can be poured into the other 
    two cords. Second, we check the pale cord and see if it can be poured 
    into the other two cords. Third, we check the veined cord and see if 
    it can be poured into the other two cords. In doing this, we get to 
    see all possible exits from this balloon. In this section, d, p, and v 
    are used as temporary storage variables to assist in finding possible 
    exits. That way, we still have the cords of the given balloon. */
    let output = "";

    let d, p, v;

    // If dark is not empty
    if (dark > 0)
    {
        // If pale is not full
        if (pale < 13)
        {
            p = Math.min(13, dark + pale);
            d = 19 - veined - p;
            output += '(' + ("0" + d).slice(-2) + ' ' + ("0" + p).slice(-2) + ' ' + ("0" + veined).slice(-2) + ") ";
        }

        // If veined is not full
        if (veined < 7)
        {
            v = Math.min(7, dark + veined);
            d = 19 - pale - v;
            output += '(' + ("0" + d).slice(-2) + ' ' + ("0" + pale).slice(-2) + ' ' + ("0" + v).slice(-2) + ") ";
        }
    }

    // If pale is not empty
    if (pale > 0)
    {
        // If dark is not full
        if (dark < 19)
        {
            d = Math.min(19, pale + dark);
            p = 19 - veined - d;
            output += '(' + ("0" + d).slice(-2) + ' ' + ("0" + p).slice(-2) + ' ' + ("0" + veined).slice(-2) + ") ";
        }

        // If veined is not full
        if (veined < 7)
        {
            v = Math.min(7, pale + veined);
            p = 19 - dark - v;
            output += '(' + ("0" + dark).slice(-2) + ' ' + ("0" + p).slice(-2) + ' ' + ("0" + v).slice(-2) + ") ";
        }
    }

    // If veined is not empty
    if (veined > 0)
    {
        // If dark is not full
        if (dark < 19)
        {
            d = Math.min(19, veined + dark);
            v = 19 - pale - d;
            output += '(' + ("0" + d).slice(-2) + ' ' + ("0" + pale).slice(-2) + ' ' + ("0" + v).slice(-2) + ") ";
        }

        // If pale is not full
        if (pale < 13)
        {
            p = Math.min(13, veined + pale);
            v = 19 - dark - p;
            output += '(' + ("0" + dark).slice(-2) + ' ' + ("0" + p).slice(-2) + ' ' + ("0" + v).slice(-2) + ") ";
        }
    }

    /* In this section of the function, we check the given balloon to see 
    if it's being shown in the adjacency list. If it isn't, then display 
    the given balloon on the adjacency list. Along with its exits, of 
    course. */
    dark = ("0" + dark).slice(-2);
    pale = ("0" + pale).slice(-2);
    veined = ("0" + veined).slice(-2);

    if (!explored_balloons.includes(dark + pale + veined))
    {
        explored_balloons.push(dark + pale + veined);
        push();
        fill(255);
        textAlign(LEFT, TOP);
        textSize(grid.cell_size);
        text('(' + dark + ' ' + pale + ' ' + veined + ") ==> " + output, 0, (30 + explored_balloons.length) * grid.cell_size);
        pop();
    }

    /* In this section of the function, we check each of the exit balloons 
    to update the adjacency matrix. d, p, and v are now being used to 
    represent an exit balloon. If the current exit balloon has never been 
    seen before, then we'll have to add in a new row and a new column for 
    it. All new cells added this way will be initially ∞, except for a 0 
    and a 1. The 0 is there to represent the length of the path from the 
    current exit balloon to itself, and the 1 is there to represent the 
    length of path from the given balloon to its exit balloon. In addition 
    to all of this, the given balloon is pushed onto a queue, which will 
    be talked about and explained later. Now, in the case that the current 
    exit balloon already exists in the graph, then the adjacency matrix 
    may need to be updated. Specifically, if the edge from the given 
    balloon to the current exit balloon is not currently in the adjacency 
    matrix, then we need to push the current exit balloon to the queue. If 
    the edge is already in the adjacency matrix, then no action needs to 
    be taken. */
    let queue = [];

    for (let current_exit_balloon = 1; current_exit_balloon < output.length; current_exit_balloon += 11)
    {
        d = output.substring(current_exit_balloon, current_exit_balloon + 2);
        p = output.substring(current_exit_balloon + 3, current_exit_balloon + 5);
        v = output.substring(current_exit_balloon + 6, current_exit_balloon + 8);

        // The current exit balloon has never been discovered
        if (!balloons.includes(d + p + v))
        {
            // Create a new row and column in the adjacency matrix
            balloon_graph[balloons.push(d + p + v) - 1] = [];

            // Display this new row and column in the webpage
            push();
            fill(255);
            textAlign(RIGHT, TOP);
            textSize(grid.cell_size);
            text(d + ' ' + p + ' ' + v, 42 * grid.cell_size, (16 + balloons.length) * 2 * grid.cell_size);
            translate((41 + 2 * balloons.length) * grid.cell_size, 33 * grid.cell_size);
            rotate(-HALF_PI);
            textAlign(LEFT, TOP);
            text(d + ' ' + p + ' ' + v, 0, 0);
            pop();

            // Push the given balloon onto the queue, unless it's already been pushed there, then no need to do so again.
            if (!queue.includes(balloons.indexOf(dark + pale + veined)))
                queue.push(balloons.indexOf(dark + pale + veined));

            // Set the values of the newly added cells
            for (let balloon = 0; balloon < balloons.length; ++balloon)
                balloon_graph[balloon][balloons.length - 1] = balloon_graph[balloons.length - 1][balloon] = Number.MAX_VALUE;
            balloon_graph[balloons.length - 1][balloons.length - 1] = 0;
            balloon_graph[balloons.indexOf(dark + pale + veined)][balloons.length - 1] = 1;
        }
        // The current exit balloon already exists in the graph
        else
        {
            if (balloon_graph[balloons.indexOf(dark + pale + veined)][balloons.indexOf(d + p + v)] != 1)
            {
                // Put the current edge in the graph and push the current exit balloon to the queue, if necessary
                balloon_graph[balloons.indexOf(dark + pale + veined)][balloons.indexOf(d + p + v)] = 1;
                queue.push(balloons.indexOf(d + p + v));
            }
        }
    }

    /* In this section of the function, we update the entire adjacency 
    matrix for each balloon in the queue, which was introduced earlier. 
    We use the Warshall-Floyd algorithm to determine the length of the 
    shortest path between any pair of balloons. And then after the 
    adjacency matrix is fully updated, we reflect those changes on the 
    webpage. */ console.log(queue);
    queue.forEach(element =>
    {
        for (let row = 0; row < balloons.length; ++row)
        {
            for (let column = 0; column < balloons.length; ++column)
            {
                balloon_graph[row][column] = Math.min(balloon_graph[row][column], balloon_graph[element][column] + balloon_graph[row][element]); // Warshall-Floyd algorithm
            }
        }
    });

    push();
    // clear away the current adjacency matrix
    fill(0);
    rect(43 * grid.cell_size, 34 * grid.cell_size, 101 * grid.cell_size, 101 * grid.cell_size);
    // display the current adjacency matrix
    fill(255);
    textAlign(LEFT, TOP);
    textSize(grid.cell_size);
    for (let row = 0; row < balloons.length; ++row)
    {
        for (let column = 0; column < balloons.length; ++column)
        {
            if (balloon_graph[row][column] == Number.MAX_VALUE)
                text('∞', (43 + column * 2) * grid.cell_size, (34 + row * 2) * grid.cell_size); // Print '∞' instead of Number.MAX_VALUE
            else
                text(balloon_graph[row][column], (43 + column * 2) * grid.cell_size, (34 + row * 2) * grid.cell_size);
        }
    }
    pop();

    /* Finally, we check the length of the output string which contains 
    all possible exits. If the output string is long enough, then we 
    insert a newline character. */
    if (output.length > 33)
        output = output.substring(0, 32) + '\n' + output.substring(33);

    return output.substring(0, output.length - 1); // omit the trailing space character
}
