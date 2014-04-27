function permute(splits, depth, windowsize) {
  windowsize = windowsize || splits.length
  depth = depth || 0;

  // Handle all but the "1" case.
  var results = [];
  for (var i = windowsize; i > 1; i--) {
    var result = process(splits, depth, i);
    results = [].concat(results, result);
  }

  // Handle the "1" case.
  results.push(splits);

  // Flatten things unless it's the first.
  if (results.length === 1 && depth !== 0) {
    results = results[0];
  }

  // FIXME: Guarantee unique values.
  return results;
}

function process(splits, depth, windowsize) {
  var shifts = splits.length - windowsize;

  var results = [];

  // We're going to try this once, no matter what.
  for (var offset = 0; offset <= shifts; offset++) {
    var result = {
      before: [],
      current: [],
      after: []
    };

    // If there is space before the sliding window, permute it.
    if (offset !== 0) { result.before = permute(splits.slice(0, offset), depth + 1); }

    // Save the current sliding window every time.
    result.current = [ splits.slice(offset, offset + windowsize).join('') ];

    // If there is space after the sliding window, permute it.
    if (offset + windowsize < splits.length) { result.after = permute(splits.slice(offset + windowsize), depth + 1); }

    // Flatten the results.
    if (result.before.length && result.after.length) {
      for (var beforeoption in result.before) {
        for (var afteroption in result.after) {
          results.push([].concat(result.before[beforeoption], result.current, result.after[afteroption]));
        }
      }
    } else if (result.before.length) {
      for (var beforeoption in result.before) {
        results.push([].concat(result.before[beforeoption], result.current));
      }
    } else if (result.after.length) {
      for (var afteroption in result.after) {
        results.push([].concat(result.current, result.after[afteroption]));
      }
    } else {
      results.push(result.current);
    }

  }

  return results;
}

var output = permute([].slice.call("abcd"));

console.log(JSON.stringify(output,null,2));
