---
tags:
  - Workpiece
  - SuSy
hotlinks:
  - "[[Control Systems]]"
---
on the most fundamental layer, an automatic locomotive system has to know two things:
- where it is (and where it isn't )
- where it should be (destination)

under the assumption that the driving system contains a pathfinder, it can communicate with track control systems and signalling systems to lay out the desired route for it.
for that, it needs to either use wireless or inductive communication methods. (the latter being a coil assembly on the wheel assembly floating closely above a partnering coil on the track)
in order to process the demanded route while maintaining flexibility and expandability a TCS needs to be split into blocs which communicate. such a network should be able to freely route trains along a great scale. 

I am considering the requirement of programming the TCS with either a proper language or mildly advanced logic (akin to redstone control). however, I think demanding to design a flexible TCS bloc network is demanding enough.

signals, as far as I'm concerned, can be divided as such:
- bloc 
	- splits track segments, allowing several trains to operate across a length without collision)
	- chain signals are also blocs but chained and can thus be designed by the user
- drive control 
	- governs maximum speed of a train or enforces a halt at stations
	- capable of reversing the engine

I imagine a transit in this system working as following:
- train receives destination
- TCS polls if the next two blocks are vacant
	- if so, start/go signal is set 
- train departs station 
- acceleration after departure signalled
- LOOP
- train enters next block, data is sent to TCS 
- TCS sets block to occupied
- TCS compares route to next switch
	- if route matches switch, send action to switch receiver 
- train does (not) take the diversion
- proceeds to the next bloc
- TCS sets previous block to vacant, new one to occupied
- END IF destination is true
- enter station block, decelerate
- approach cargo transfer, begin docking 