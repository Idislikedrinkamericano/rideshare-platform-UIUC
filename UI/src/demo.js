const future=(days,hour,minute=0)=>{const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,minute,0,0);return d.toISOString();};
export const demoRides=[
{id:9001,starting_location:'Champaign, IL',end_destination:'Chicago, IL',ride_time:future(2,14,30),seats_available:2,driver_username:'Maya',driver_rating:'4.9',ride_description:'Heading downtown after class. One small bag per rider.'},
{id:9002,starting_location:'UIUC Campus',end_destination:"O'Hare International Airport",ride_time:future(3,16,15),seats_available:3,driver_username:'Ethan',driver_rating:'4.8',ride_description:'Direct airport ride. Pickup near Illini Union.'},
{id:9003,starting_location:'Champaign, IL',end_destination:'Naperville, IL',ride_time:future(4,9),seats_available:1,driver_username:'Sofia',driver_rating:'5.0',ride_description:'Quiet morning drive with a coffee stop on the way.'}
];
