var array = [3,4,5,0,5,6,7,0,2,3];

for(var i = 0; i < array.length; i++){
    if(array[i] != 0){
        var counter = i+1;
        while(array[counter] != 0 && counter < array.length){
          counter++;
        }
        if(counter-1 != i){
          //array.fill(0, i+1, counter);
          //console.log(array.fill(0, i+1, counter));
          array = array.fill(0, i+1, counter);
          console.log(array.fill(0, i+1, counter));
        }
        i = counter-1;
    }
}

array.forEach(function(element) {
  console.log(element);
});
