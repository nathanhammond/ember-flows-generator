function permute(splits, depth, windowsize) {
  windowsize = windowsize || splits.length
  depth = depth || 0;

  var results = {};
  for (var i = windowsize; i > 1; i--) {
    results[i] = process(splits, depth, i);
  }

  // Handle the easy case.
  results["1"] = [ { current: splits } ];
  return results;
}

function process(splits, depth, windowsize) {
  var shifts = splits.length - windowsize;

  var results = [];

  // We're going to try this once, no matter what.
  for (var offset = 0; offset <= shifts; offset++) {
    var result = {};

    // If there is space before the sliding window, permute it.
    if (offset !== 0) { result.before = permute(splits.slice(0, offset), depth + 1); }

    // Save the current sliding window every time.
    result.current = [ splits.slice(offset, offset + windowsize).join('') ];

    // If there is space after the sliding window, permute it.
    if (offset + windowsize < splits.length) { result.after = permute(splits.slice(offset + windowsize), depth + 1); }

    results.push(result);
  }

  return results;
}

var output = permute([].slice.call("abcd"));

console.log(JSON.stringify(output,null,2));
