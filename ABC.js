import pick from 'pick-random-weighted';

//=================================================================================

//functions.
//SPHERE
const Sphere = (food_source) => {
    //Summation of x*x;

    let val = 0;
    for (let i = 0; i < Dimensions; i++) {
        val += food_source[i] * food_source[i];
    }
    return val;
}

//ROSENBROCK
const Rosenbrock = (food_source) => {
    let val=0;
    for (let i = 0; i < Dimensions - 1; i++) {
        val += 100 * (food_source[i+1] - food_source[i] * food_source[i]) * (food_source[i+1] - food_source[i] * food_source[i]) + (1 - food_source[i]) * (1 - food_source[i]);
    }
    return val;
}

//RASTRIGIN
const Rastrigin = (food_source) => {

    let n = 2;
    let A = 10;
    let val = A * n;
    for (let i = 0; i < Dimensions; i++) {
        val += (food_source[i] * food_source[i] - A * Math.cos(Math.PI * 2 * food_source[i]));
    }
    return val;
}

//ACKLEY
const Ackley = (food_source) => {
    //only 2 parameter
    let x = food_source[0];
    let y = food_source[1];
    let val = -20*Math.exp(-0.2*Math.sqrt(0.5*(x*x+y*y))) - Math.exp(0.5*(Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y))) + (Math.E + 20);
    return val;

}


// evalute function 
const evaluate = (food_source) => {

    if (function_optimization == "RASTRIGIN") {
        return Rastrigin(food_source);
    } else if (function_optimization == "ROSENBROCK") {
        return Rosenbrock(food_source);
    } else if (function_optimization == "ACKLEY") {
        return Ackley(food_source);
    } else if (function_optimization == "SPHERE") {
        return Sphere(food_source);
    }
}

// calculate fitness 
const fitness = (food_source) => {
    return (1 /(1+evaluate(food_source)));
}

//=================================================================================

// generate food_sources_population 
const InitializeFoodSources = () => {
    let dim;
    let element;
    for (let i = 1; i <= P_size; i++){
        element = [];
        for (let i = 0; i < Dimensions; i++){
            dim = Lower + (Upper - Lower) * Math.random();
            element.push(dim);
        }
        food_sources_population.push(element);
    }
}

//finding best
const findBestFitnessIDX = (pop) => {
    let bestFit = fitness(pop[0]);
    let bestIDX = 0;
    for (let i = 1; i < P_size; i++) {
        let currentFitness = fitness(pop[i]);
        if (bestFit < currentFitness) {
            bestIDX = i;
            bestFit = currentFitness;
        }
    }
    return bestIDX;
}


//employee task
const EmployeeBeePhase = () => {
    
    return food_sources_population.map((current_source, idx) => {
        //generating fi for each source
        
        let new_source = [...current_source];
        let fi = (Math.random() * 2) - 1;
        
        //choose random partner
        let i = Math.floor(Math.random() * P_size); //i != idx
        while (i == idx) {
            i = Math.floor(Math.random() * P_size);
        }
        //finding radom index 
        let j = Math.floor(Math.random() * Dimensions);
        
        new_source[j] = current_source[j] + fi * (current_source[j] - food_sources_population[i][j])
        
        //return if new is better.. else increase trial by 1
        let new_fitness = fitness(new_source); 
        if (new_fitness > fitnessFoodSource[idx]) {
            fitnessFoodSource[idx] = new_fitness;
            // console.log("he", new_source);
            return new_source;
        } else {
            trial[idx] += 1;
            return current_source;
        }
    })

}

//onLookerBeePhase
const OnLookerBeePhase = () => {
    let counter = 0;

    let onLooker_food_source = new Array(P_size);
    //
    for (let k = 0; k < P_size; k++){

        //random number between [0, 1]
        while (Math.random() > probability[counter]) {
            // go untill not chosen 
            counter = (counter+1) % P_size;
        }
        let current_source = [...new_food_source[counter]]
        //generating fi for each source
        let new_source = [...current_source];
        let fi = (Math.random() * 2) - 1;

        //choose random partner
        let i = Math.floor(Math.random() * P_size); //i != counter
        while (i == counter) {
            i = Math.floor(Math.random() * P_size);
        }
        //finding radom index 
        let j = Math.floor(Math.random() * Dimensions);
        new_source[j] = current_source[j] + fi * (current_source[j] - new_food_source[i][j])
        //return if new is better.. else increase trial by 1
        let new_fitness = fitness(new_source); 
        if (new_fitness > fitnessFoodSource[counter]) {
            fitnessFoodSource[counter] = new_fitness;
            onLooker_food_source[k] = new_source;
        } else {
            trial[counter] += 1;
            onLooker_food_source[k] = current_source;
        }
    }
    return onLooker_food_source;
}

// Scout phase 
const ScoutPhase = () => {

    for (let i = 0; i < P_size; i++) {
        if (trial[i] > 1) {
            //this food source is not efficient
            //removing this food source
            trial[i] = 0;
            let dim;    
            let element = [];
            for (let i = 0; i < Dimensions; i++){
                dim = Lower + (Upper - Lower) * Math.random();
                element.push(dim);
            }
            onLooker_food_source[i] = element;
            fitnessFoodSource[i] = fitness(element);
        }
    }

}

//Domains and Dimentions
let food_sources_population = [];
let P_size = 100;
let trial = new Array(P_size).fill(0)
let fitnessFoodSource = [];
let trial_limit = 1;


// let Lower=-5;
// let Upper=5;
// let Dimensions = 2;
// let function_optimization = "RASTRIGIN";

// let Lower=-500;
// let Upper=500;
// let Dimensions = 3;
// let function_optimization = "ACKLEY";

// let Lower=-100;
// let Upper=100;
// let Dimensions = 10;
// let function_optimization = "ROSENBROCK";

// let Lower=-99999;
// let Upper=99999;
// let Dimensions = 3;
// let function_optimization = "SPHERE";


// first initializing cs/2 food sources 
InitializeFoodSources(); //in their domain
// all food sources are acquired

let generation = 1;
let new_food_source = [];
let total_fitness_of_all_sources = [];
let probability = [];
let onLooker_food_source = [];


while (generation <= 10000) {
    // >>>console.log(food_sources_population)
    // console.log(findBestFitnessIDX(food_sources_population))
    
    
    console.log(`Generation ${generation} --> Best Fit F(x) val: ${Sphere(food_sources_population[findBestFitnessIDX(food_sources_population)])}`) 
    //get all fitness
    fitnessFoodSource = food_sources_population.map((source) => fitness(source))


    //===============================EMPLOYEE BEE PHASE===============================


    new_food_source = EmployeeBeePhase();
    //fitness also updated

    // >>>console.log(new_food_source)
    // console.log(findBestFitnessIDX(new_food_source))

    //total fitness or all sources
    total_fitness_of_all_sources = fitnessFoodSource.reduce((a, b) => a + b, 0)

    //getting probability of fitness [0,1];
    probability = fitnessFoodSource.map(fit => fit / total_fitness_of_all_sources);

    //===============================ON_LOOKER BEE PHASE===============================

    onLooker_food_source = OnLookerBeePhase();

    // >>>console.log(onLooker_food_source)
    // console.log(findBestFitnessIDX(onLooker_food_source))
    // console.log(trial)

    //===============================SCOUT BEE PHASE===============================

    ScoutPhase();
    //onLooker_food_source is updated
    food_sources_population = onLooker_food_source;
    generation++;
}
console.log(`Generation ${generation} --> Best Fit F(x) val: ${Sphere(onLooker_food_source[findBestFitnessIDX(onLooker_food_source)])}`) 