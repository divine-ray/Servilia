---
tags:
  - SuSy
---
Yes, this is all highly subjective and biased. It is My Opinion™.

%%fix shitty GCYM assembler%%

## Tiers and Associated

## Circuits
The circuits serve solely as gating method and are typically thrown in as arbitrary component to make obtaining That Machine marginally harder. Their scaling is utterly ridiculous, as with the material progression as the sense of reality fades away. 

There simply is no need for four or more variations of a technology-tiered circuit. Stop it. 
Those cases where the computation is actually applicable (I.e. Research Station and related), the craziness of progression has already gone haywire and then demands Sentient Mainframe Computers or similar to analyse some piece of tech that already has been made a dozen times throughout the game, only in different flavours because "Muh, Tiers!". 

Machines that do not perform explicit complex calculations shouldn’t have complex circuits involved in their cost, but only what would realistically be used to coordinate sensor-actor systems. Instead, the circuits should be used in the sub-systems composing a machine (read: the components) such as sensors, robot arms and emitters.
## Retro-Active Improvements
Progressing in GT, at least in my experiences, never had the previous tier become cheaper or such. I always was left with the same methods to make the tier-specific material (elaborated below), and nothing upgraded in terms of yield or material efficiency but only speed due to how GT handles overclocking. 
The nature of non-linear advancing like IRL does not translate well to the “always forward never back” mindset that many games, dare say the entire gaming industry, have. This makes it difficult to implement mechanics where progress is rewarded with improvements that go substantially beyond ripping out That Assembly/Chemistry Line and replacing it with Mark II machines.
One possible idea here would be to be able to make machines of any tier at any given point, but at a drastically increased effort, since one cannot access ideal processing and refining technology yet and is only left to cruder methods. 
When the variables are filled this would mean “I am able to make Tungsten and Titanium (or other tier-gated materials) at LV, but at a horrible yield (a lot of power and material wasted).
For Tungsten, it was already used in WW1 and first discovered in 1781, which makes it nonsensical to gate it to IV. 
## Materials
The GT5u family is badly afflicted with material orphanage, that meaning, manifolds of materials, metals and alloys having few or oftentimes only one use for something barely justified or sensical (when viewed with realism). 
IRL there's a reason for the 2500 registered and recognised steel variants, since each of them has a very specialised use, whereas GT5u/GTCE(u) lavishly adds new materials for the reasons of grind, gating and avoiding recipe conflicts. 
In many such cases, the requirements are exotic and commonly out of place, since a nickel or copper super-alloy does not belong into the external structure of a large crusher.
The auto-generation of components from a material (ie rod, small gear, plate, etc.) adds to the bloat, since many orphan materials have completely useless autogen items.
	*I don't want to have to look through bloat and useless items which can only be recycled to find the sole use-case of a "Maraging MAR762 plate".*
Gregicality Multiblocks/GT++ especially suffers from this, as each multiblock has it's own unique casing and associated alloy, who are solely used for this single thing and never again. 
	(This issue might be solved by completely axing the rather blocky and ugly GCYM multis and replacing them.)
It suffers from the loop of the following:
- Unlock `This Tier X`
- Automate/obtain `This Tier's Materials`
- Progress
- Unlock `This Tier Y`
- Forget about `This Tier X`
# SuSy-Specific Gripes 

SuSy's multiblocks should and could make use of already present GCYM components. This refers to the electrolytic cell block for the parallelised electrolysis cell, which has shiny funky RGB effects. 
I heard someone complain that it is too expensive, costing IV-something circuits: SIMPLY ADJUST THE PRICING.
Additionally, there should be machines that enable higher throughput of processing materials and chemicals, such as a multiblock roaster. 
Technologically speaking *it is not that hard* to build a machine that really just fries/mixes feedstock (Roaster). 
## Lack of direction on myriads of chemicals
SuSy as a pack has a ton of intermediate chemicals, and it bothers me that i have to look through 10 NEI pages to see which specific chain they're related to.
### Solution
Add a tooltip to these chemicals and components in the general format of the following:
	Derived from \[Predecessor].
	Used in \[Product]. 
	Associated to \[Final Product] and \[Initial Component] Processing.
	*Optionally:*
	Part in \[Name of Pocessing Chain].
### Example: Pig Iron
 Derived from **Iron Ores**.
 Used in **Steel, Wrought Iron**. 
 Associated to **Steel** and **Iron Ore** Processing.
 Part in **Extraction of iron metal from ore**. 