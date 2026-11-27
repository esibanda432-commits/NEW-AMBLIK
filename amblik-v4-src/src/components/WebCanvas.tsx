import { useEffect, useRef } from 'react';

// Purposeful connection geometry: a small number of meaningful nodes and paths.
// This is a workflow/network motif, not a literal spider web.
// Brand palette: turquoise / deep teal paths, with violet, orchid and gold as node accents.
const EDGE = ['rgba(62,199,207,.75)','rgba(255,255,255,.18)','rgba(120,70,232,.6)','rgba(255,255,255,.18)','rgba(160,68,165,.55)'];
const NODE = ['#FFFFFF','#D7A24D','#7846E8','#A044A5','#3EC7CF'];
export default function WebCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, dpr = 1, raf = 0, start = performance.now();
    const points = [
      [0.12,0.28],[0.28,0.18],[0.43,0.36],[0.58,0.16],[0.74,0.31],[0.9,0.18],
      [0.2,0.72],[0.4,0.62],[0.62,0.76],[0.82,0.62],[0.96,0.78]
    ];
    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,2],[2,8],[8,9],[9,10],[4,9],[7,8]];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = r.width; height = r.height; dpr = Math.min(2,window.devicePixelRatio||1);
      canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if (reduced) draw(0);
    };
    const draw = (time:number) => {
      ctx!.clearRect(0,0,width,height);
      const pts = points.map(([x,y],i)=>({x:width*x,y:height*y+Math.sin(time*.00045+i)*3}));
      ctx!.lineWidth = 1.15;
      edges.forEach(([a,b],i)=>{
        ctx!.beginPath(); ctx!.moveTo(pts[a].x,pts[a].y); ctx!.lineTo(pts[b].x,pts[b].y);
        ctx!.strokeStyle = EDGE[i%EDGE.length]; ctx!.stroke();
      });
      pts.forEach((p,i)=>{
        ctx!.beginPath(); ctx!.arc(p.x,p.y,i===2||i===4?4.5:3,0,Math.PI*2);
        ctx!.fillStyle = i===2?'#FF3B1F':i===4?'#3EC7CF':NODE[i%NODE.length]; ctx!.fill();
      });
    };
    const tick=(now:number)=>{draw(now-start);raf=requestAnimationFrame(tick);};
    resize();
    const ro=new ResizeObserver(resize); ro.observe(canvas);
    if(!reduced) raf=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return <canvas ref={ref} className="webcanvas" aria-hidden="true" />;
}
