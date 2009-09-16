// Import the optparse script
var optparse = require('../src/optparse.js');

// Define some options
var SWITCHES = [
    ['-i', '--include-file FILE', "Includes a file"],
    ['-p', '--print [MESSAGE]', "Prints an optional message on screen"],
    ['-d', '--debug', "Enables debug mode"],
    ['-H', '--help', "Shows this help section"],
    ['--date DATE', "A date. A date is expected E.G. 2009-01-14"],
    ['--number NUMBER', "A Number. Supported formats are 123, 123.123, 0xA123"],
];

function onLoad() {
    // Create a new OptionParser with defined switches
    var parser = new optparse.OptionParser(SWITCHES), print_summary = true, 
        first_arg;
    parser.banner = 'Usage: nodejs-test.js [options]';
    
    // Internal variable to store options.
    var options = {
        debug: false,
        files: [],
        number: undefined,
        date: undefined
    };
    
    // Handle the first argument (switches excluded)
    parser.on(0, function(value) {
        first_arg = value;
    });
    
    // Handle the --include-file switch
    parser.on('include-file', function(value) {
        options.files.push(value);
    });

    // Handle the --print switch
    parser.on('print', function(value) {
        puts('PRINT: ' + (value || 'No message entered'));
    });

    // Handle the --date switch
    parser.on('date', function(value) {
        options.date = value;
    });

    // Handle the --number switch
    parser.on('number', function(value) {
        options.number = value;
    });

    // Handle the --debug switch
    parser.on('debug', function() {
        options.debug = true;
    });

    // Handle the --help switch
    parser.on('help', function() {
        puts(parser.toString());
        print_summary = false;
    });
    
    // Parse command line arguments
    parser.parse(ARGV);
    
    if(print_summary) {
        puts("First non-switch argument is: " + first_arg);
        
        // Output all files that was included.
        puts("No of files to include: " + options.files.length);
        for(var i = 0; i < options.files.length; i++) {
            puts("File [" + (i + 1) + "]:" + options.files[i]);
        }

        // Is debug-mode enabled?
        puts("Debug mode is set to: " + options.debug);

        puts("Number value is: " + options.number);
        puts("Date value is: " + options.date);
    }
}