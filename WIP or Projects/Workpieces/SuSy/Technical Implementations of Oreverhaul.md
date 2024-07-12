#SuSy
[[Flaws of GT5u and Related]]
- I want to have a handler that allows multiblock controllers to run more than one recipe map.
	This is to unify similar multiblocks into one controller while retaining the differences in function. 
	The use case i have in mind are merged processing machines for ores, categorized after method (mechanical (Jaw crusher, VSI, gyratory..), chemical (leaching), separation (...), etc.). 
- Alternately, a system akin to immersive engineering's multi handling with specific components being exchangeable (such as a drive motor or wearing parts such as gearboxes or abrasives).
	The main issue (which greggers will encounter) is that IE's system omits the flexibility of IO transfer.
- Secondly, (Optional) having the capability of processing recipes depending on a NBT tag of a item (ex. itemSize) result in a different recipe.
	 This is to alleviate bloating into myriads of combinations of things like "Small Poor Magnetite Ore", and instead merge them into "Magnetite Ore: Size Small, Quality: Poor"