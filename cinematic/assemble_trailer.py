"""Assemble three Blender-rendered cinematic shots into a 12 second 1080p trailer."""
import bpy, math, wave, struct
from pathlib import Path
ROOT=Path(__file__).resolve().parent;OUT=ROOT/'renders'
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.fps=24;s.frame_start=1;s.frame_end=288
s.view_settings.view_transform='Standard';s.view_settings.look='Medium High Contrast' if 'Medium High Contrast' in [] else 'None'
s.render.image_settings.file_format='FFMPEG';s.render.ffmpeg.format='MPEG4';s.render.ffmpeg.codec='H264';s.render.ffmpeg.constant_rate_factor='HIGH';s.render.ffmpeg.ffmpeg_preset='GOOD';s.render.ffmpeg.audio_codec='AAC';s.render.ffmpeg.audio_bitrate=192;s.render.filepath=str(ROOT/'Thornwake_Trailer.mp4')
ed=s.sequence_editor_create()
for j,name in enumerate(['01_pilgrims_rest','02_hollow_road','03_crownless_court']):
 strip=ed.sequences.new_image(name,str(OUT/(name+'.png')),channel=1,frame_start=j*96+1);strip.frame_final_duration=96
 strip.transform.scale_x=1;strip.transform.scale_y=1;strip.transform.keyframe_insert('scale_x',frame=j*96+1);strip.transform.keyframe_insert('scale_y',frame=j*96+1)
 strip.transform.scale_x=1.08;strip.transform.scale_y=1.08;strip.transform.keyframe_insert('scale_x',frame=j*96+96);strip.transform.keyframe_insert('scale_y',frame=j*96+96)
 strip.blend_type='ALPHA_OVER';strip.blend_alpha=0;strip.keyframe_insert('blend_alpha',frame=j*96+1);strip.blend_alpha=1;strip.keyframe_insert('blend_alpha',frame=j*96+13);strip.keyframe_insert('blend_alpha',frame=j*96+84);strip.blend_alpha=0;strip.keyframe_insert('blend_alpha',frame=j*96+96)
font_path=Path('C:/Windows/Fonts/georgia.ttf')
font=bpy.data.fonts.load(str(font_path)) if font_path.exists() else None
def text(name,body,start,end,channel,size,y):
 st=ed.sequences.new_effect(name,type='TEXT',channel=channel,frame_start=start,frame_end=end);st.text=body;st.font_size=size;st.color=(.91,.85,.70,1);st.location=(.5,y);st.align_x='CENTER';st.use_shadow=True;st.shadow_color=(.005,.015,.018,1);st.blend_type='ALPHA_OVER'
 if font:st.font=font
 return st
text('Chapter','PILGRIM’S REST',15,89,3,28,.14)
text('Road','A light beneath the leaves.',111,179,3,32,.14)
text('Title','THORNWAKE',200,287,3,95,.68)
text('Subtitle','–  The Sunken Weald  –',200,287,4,35,.59)
text('Tagline','A light beneath the leaves. A keeper beneath the crown.',211,287,5,28,.16)
# A quiet original drone with struck harmonics; no sampled assets.
rate=44100;duration=12
with wave.open(str(OUT/'score.wav'),'w') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate)
 buf=bytearray()
 for i in range(rate*duration):
  t=i/rate;env=min(1,t/1.5,(duration-t)/1.8);v=(math.sin(t*2*math.pi*55)*.09+math.sin(t*2*math.pi*82.4)*.055+math.sin(t*2*math.pi*110)*.03)
  for strike in [0,4,8]:
   a=t-strike
   if a>=0:v+=math.sin(a*2*math.pi*220)*.12*math.exp(-a*1.1)+math.sin(a*2*math.pi*330)*.065*math.exp(-a*1.5)
  buf.extend(struct.pack('<h',int(max(-1,min(1,v*env)) * 32767)))
 w.writeframes(buf)
sound=ed.sequences.new_sound('A fallen sun',str(OUT/'score.wav'),channel=2,frame_start=1)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Trailer_Edit.blend'))
bpy.ops.render.render(animation=True)
print('TRAILER_READY',s.render.filepath,flush=True)
