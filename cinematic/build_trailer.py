"""Recreate the actual procedural Three.js chapter as a cinematic Blender scene.
Run: blender --background --python cinematic/build_trailer.py -- --stills
Use --animate to render the complete native camera animation instead.
"""
import bpy, json, math, sys, os
from pathlib import Path
from mathutils import Matrix, Vector
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'renders'; OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES' if '--cycles' in sys.argv else 'BLENDER_EEVEE_NEXT'
if hasattr(scene.eevee,'taa_render_samples'):scene.eevee.taa_render_samples=64
scene.cycles.samples=64
scene.cycles.use_denoising=True
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences
 prefs.compute_device_type='OPTIX'; prefs.get_devices()
 for d in prefs.devices: d.use=d.type!='CPU'
 if any(d.type!='CPU' for d in prefs.devices): scene.cycles.device='GPU'
except Exception: pass
scene.render.resolution_x=1920; scene.render.resolution_y=1080; scene.render.resolution_percentage=100
scene.render.fps=24;scene.frame_start=1;scene.frame_end=288
scene.render.image_settings.file_format='PNG'
scene.world.color=(.06,.09,.1)
world=bpy.data.worlds.new('The blue hour');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.12,.21,.24,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.24
scene.view_settings.view_transform='AgX'
scene.render.film_transparent=False
materials={}
def material(color,metal,rough):
 key=tuple(color)+(metal,rough)
 if key in materials:return materials[key]
 m=bpy.data.materials.new('Weathered steel' if metal>.6 else 'Moss and ancient stone');m.use_nodes=True
 n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=max(.27,rough)
 noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=95 if metal>.6 else 5;noise.inputs['Detail'].default_value=3
 bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.17 if metal>.6 else .35;bump.inputs['Distance'].default_value=.025 if metal>.6 else .12
 l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],p.inputs['Normal'])
 materials[key]=m;return m
C=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
data=json.loads((ROOT/'scene.json').read_text())
hero=[];enemies=[]
for i,obj in enumerate(data['meshes']):
 vals=obj['positions'];verts=[vals[j:j+3] for j in range(0,len(vals),3)]
 idx=obj['indices'] or list(range(len(verts)));faces=[idx[j:j+3] for j in range(0,len(idx),3)]
 me=bpy.data.meshes.new(obj['name']);me.from_pydata(verts,[],faces);me.update()
 ob=bpy.data.objects.new(obj['name'],me);scene.collection.objects.link(ob)
 ar=obj['matrix'];M=Matrix([ar[j:j+4] for j in range(0,16,4)]).transposed();ob.matrix_world=C@M
 ob.data.materials.append(material(obj['color'],obj['metalness'],obj['roughness']))
 if obj.get('owner')=='knight':hero.append(ob)
 if obj.get('owner')=='enemy':enemies.append(ob)
 if obj['metalness']>.6:
  bevel=ob.modifiers.new('Soft worn edges','BEVEL');bevel.width=.015;bevel.segments=2
  normals=ob.modifiers.new('Weighted highlights','WEIGHTED_NORMAL')
for ob in enemies:ob.hide_render=ob.location.y<24
# Lit mist adds real volumetric shafts between the tree silhouettes.
bpy.ops.mesh.primitive_cube_add(size=2,location=(0,10,7));fog=bpy.context.object;fog.name='Canopy mist';fog.scale=(38,55,10)
m=bpy.data.materials.new('Cool atmospheric scattering');m.use_nodes=True;n=m.node_tree.nodes;n.clear()
o=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=.018;v.inputs['Color'].default_value=(.42,.57,.54,1);v.inputs['Anisotropy'].default_value=.35;m.node_tree.links.new(v.outputs['Volume'],o.inputs['Volume']);fog.data.materials.append(m)
def light(name,kind,pos,color,energy,size=4):
 d=bpy.data.lights.new(name,kind);d.energy=energy;d.color=color
 if kind=='AREA':d.shape='DISK';d.size=size
 if kind=='SUN':d.angle=.1
 ob=bpy.data.objects.new(name,d);scene.collection.objects.link(ob);ob.location=pos;return ob
sun=light('Late sun through the canopy','SUN',(-12,20,20),(1,.79,.48),3.0);sun.rotation_euler=(.42,-.5,-.5)
key=light('Silver armor softbox','AREA',(2,-15,6),(.64,.8,1),800,5)
fire=light('Pilgrim flame','POINT',(-3,-11,1.3),(1,.28,.055),240);fire.data.shadow_soft_size=1.1
altar=light('The buried sun','AREA',(1,34,6),(1,.72,.32),900,3);altar.rotation_euler=(0,0,0)
# Recreate animated flame shapes omitted from the static export.
def emit(name,color,strength):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=strength;return m
flame=emit('Amber fire',(1,.24,.018),5)
for i in range(5):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=(-3+math.sin(i*2)*.22,-11+math.cos(i*2)*.2,.6))
 ob=bpy.context.object;ob.scale=(.17,.17,.55+i*.06);ob.data.materials.append(flame)
# Small wind-borne embers catch the focus plane.
for i in range(28):
 a=i*2.399;h=.7+(i%9)*.3
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.015,location=(-3+math.sin(a)*(.2+h*.15),-11+math.cos(a)*.4,h))
 bpy.context.object.data.materials.append(flame)
# Camera with three authored scenes: refuge, the road, and the crownless court.
camdata=bpy.data.cameras.new('Trailer Camera');cam=bpy.data.objects.new('Trailer Camera',camdata);scene.collection.objects.link(cam);scene.camera=cam
camdata.lens=45;camdata.dof.use_dof=True;camdata.dof.aperture_fstop=5.6
focus=bpy.data.objects.new('Focus',None);scene.collection.objects.link(focus);camdata.dof.focus_object=focus
hero_base=[o.matrix_world.copy() for o in hero]
def place_hero(x,z):
 delta=Vector((x+1,-z+14,0))
 for ob,base in zip(hero,hero_base):ob.matrix_world=base.copy();ob.location+=delta

def shot(name,location,target,knight_pos,keypos):
 place_hero(*knight_pos);cam.location=location;focus.location=target;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();key.location=keypos;key.rotation_euler=(Vector(target)-key.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(OUT/(name+'.png'))
shots=[('01_pilgrims_rest',(5,-20,4.5),(-1,-13,1.25),(-1,14),(3,-15,5)),('02_hollow_road',(-5,6,3.4),(0,11,1.25),(0,-11),(-3,8,6)),('03_crownless_court',(4,19,5.5),(1,31,2.2),(1,-27),(3,26,6))]
# Keyframes remain in the .blend so the trailer can also be rendered in native 3D.
for j,(name,pos,target,kp,keypos) in enumerate(shots):
 shot(name,pos,target,kp,keypos)
 for frame,offset in [(j*96+1,0),(j*96+96,-1.1)]:
  cam.location=Vector(pos)+Vector((offset,0,.1*offset));cam.keyframe_insert('location',frame=frame);cam.keyframe_insert('rotation_euler',frame=frame)
  focus.keyframe_insert('location',frame=frame)
  for ob in hero:ob.keyframe_insert('location',frame=frame)
  key.keyframe_insert('location',frame=frame);key.keyframe_insert('rotation_euler',frame=frame)
scene.use_nodes=True;n=scene.node_tree.nodes;n.clear();r=n.new('CompositorNodeRLayers');glow=n.new('CompositorNodeGlare');glow.glare_type='FOG_GLOW';glow.quality='HIGH';glow.threshold=1.5;out=n.new('CompositorNodeComposite');scene.node_tree.links.new(r.outputs['Image'],glow.inputs['Image']);scene.node_tree.links.new(glow.outputs['Image'],out.inputs['Image'])
scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Thornwake.blend'))
if '--stills' in sys.argv:
 for j,(name,pos,target,kp,keypos) in enumerate(shots):
  if '--only-court' in sys.argv and j!=2:continue
  if '--skip-rest' in sys.argv and j==0:continue
  if '--resume' in sys.argv and (OUT/(name+'.png')).exists():continue
  scene.frame_set(j*96+1);shot(name,pos,target,kp,keypos);print('RENDERING',name,flush=True);bpy.ops.render.render(write_still=True)
if '--animate' in sys.argv:
 scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'frame_');bpy.ops.render.render(animation=True)
print('THORNWAKE CINEMATIC COMPLETE',flush=True)
