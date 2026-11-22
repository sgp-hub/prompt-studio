import {modes,profiles,statuses} from "./profiles.mjs";
import {propose,assemble,guidance,packageText} from "./engine.mjs";

export default function render({parentElement,data,setTriggerValue}) {
  const el=id=>parentElement.querySelector("#"+id);
  const root=el("studio");
  const state=root.model??={mode:"Basic",task:"Document or email",tab:"brief",files:[],special:{},project:null,dirty:false,stale:true,savePending:false};
  const message=text=>{el("message").textContent=text};
  const element=(tag,text="")=>{const e=document.createElement(tag);e.textContent=text;return e};
  const options=(select,items)=>select.replaceChildren(...items.map(v=>new Option(v,v)));
  function field(parent,key,label,value,change,multi=false){
    const wrap=element("label",label), input=element(multi?"textarea":"input");
    input.value=value||"";input.dataset.field=key;input.oninput=()=>change(input.value);wrap.append(input);parent.append(wrap);return input;
  }
  function group(parent,title){
    const box=element("details");box.append(element("summary",title));parent.append(box);return box;
  }
  // Move the existing controls, rather than duplicating their state or handlers.
  function presentation(){
    const ready=!!state.project?.prompt&&!state.stale;
    root.classList.add("studioLayout");
    root.classList.toggle("basic",state.mode==="Basic");
    el("basicToolbar").hidden=false;el("basicTools").hidden=false;
    el("approve").closest("label").hidden=true;
    el("generate").textContent="Generate prompt";
    el("review").querySelector(".hint").textContent="Edit the proposed scope, tools and checks before generating your prompt.";
    el("reviewNext").textContent="Review the plan, then select Generate prompt.";
    el("basicModes").append(el("modes"));
    root.querySelector("aside").prepend(el("package"));
    root.querySelector("h1").textContent="StrYkR AI PROMPT STUDIO";
    el("packageNext").textContent="Next: copy the prompt into your chosen AI chat and follow its task-specific guidance.";
    el("package").hidden=false;
    el("guide").hidden=true;
    el("prompt").readOnly=!ready;
    el("prompt").placeholder="Your execution prompt will appear here after you review the plan and select Generate prompt.";
    if(!ready)el("prompt").value="";
    const b=(!state.stale&&state.project?.brief)||{mode:state.mode,files:[]};
    const p=(!state.stale&&state.project?.plan)||{workspace:"the project workspace specified in your brief",contract:"The outcome and format defined in your approved plan."};
    el("usage").textContent=guidance(b,p);
    for(const id of ["copyPrompt","export","save"])el(id).disabled=!ready;
  }
  function tab(which){
    state.tab=which;el("message").textContent="";
    for(const name of ["brief","review"]){
      el(name).hidden=name!==which;
      el(name+"Tab").setAttribute("aria-current",name===which?"step":"false");
    }
    el("reviewTab").disabled=!state.project||state.stale;
    const planned=!!state.project&&!state.stale;
    el("trackPanel").hidden=!planned;el("guide").hidden=planned;
    presentation();
  }
  function invalidate(){
    state.stale=true;state.dirty=true;el("approve").checked=false;tab("brief");
    el("trackHint").textContent="Review the current brief to see its stages.";el("trackRows").replaceChildren();
  }
  function taskFields(){
    el("special").replaceChildren();el("followTitle").textContent=state.task+" details";
    const cache=state.special[state.task]??={};
    for(const name of profiles[state.task][3])field(el("special"),name,name,cache[name],v=>cache[name]=v);
    el("connections").hidden=state.task!=="Multi-app automation";
    for(const b of el("modes").children)b.setAttribute("aria-pressed",String(b.textContent===state.mode));
  }
  function choose(mode,task){
    const old=profiles[state.task][2];state.mode=mode;state.task=task;
    options(el("task"),modes[mode]);el("task").value=task;
    if(!el("result").value||el("result").value===old)el("result").value=profiles[task][2];
    el("planPreview").textContent="This plan will use: "+profiles[task][0]+" · "+profiles[task][1];
    taskFields();
    presentation();
  }
  function brief(){
    const b={mode:state.mode,task:state.task,files:structuredClone(state.files),special:{...state.special[state.task]}};
    for(const k of ["goal","result","material","tools","avoid","context","example","workspace","sourceApp","runner","targetApp"])b[k]=el(k).value.trim();
    if(b.task==="Multi-app automation"&&[b.sourceApp,b.runner,b.targetApp].some(v=>!v))throw Error("Name the trigger source, workflow runtime and destination.");
    return b;
  }
  function review(){
    const p=state.project.plan;
    function change(obj,k,v){obj[k]=v;el("approve").checked=false;state.dirty=true;state.project.prompt="";state.project.progress=p.stages.map(()=>({status:"Not started",note:"",next:""}));tab("review");tracker();}
    el("reviewFields").replaceChildren();
    for(const [k,label] of Object.entries({scope:"MVP scope",role:"Agent role",approach:"Architecture / approach",assumptions:"Assumptions and access decisions",workspace:"Work location",contract:"Output contract",criteria:"Acceptance criteria"}))
      field(el("reviewFields"),k,label,p[k],v=>change(p,k,v),["scope","assumptions","criteria"].includes(k));
    el("appRows").replaceChildren();p.apps.forEach((a,i)=>{
      const g=group(el("appRows"),a.name+" · "+a.role);
      for(const [k,label] of Object.entries({name:"App or service",role:"Role",when:"Used when",where:"Workspace / location",human:"Human action",agent:"Agent action"})){
        const f=field(g,k,label,a[k],v=>{change(a,k,v);g.firstChild.textContent=a.name+" · "+a.role});
        if(state.task==="Multi-app automation"&&["Trigger source","Workflow runtime","Destination"].includes(a.role)&&k==="role")f.readOnly=true;
      }
      if(!["Planning and drafting","Trigger source","Workflow runtime","Destination"].includes(a.role)){
        const remove=element("button","Remove tool");remove.onclick=()=>{p.apps.splice(i,1);change(p,"apps",p.apps);review()};g.append(remove);
      }
    });
    el("stageRows").replaceChildren();p.stages.forEach((s,i)=>{
      const g=group(el("stageRows"),(i+1)+". "+s.name);
      for(const [k,label] of Object.entries({agent:"Agent will",human:"You need to",check:"Completion check",location:"Apps / location"}))field(g,k,label,s[k],v=>change(s,k,v),true);
    });
    el("approve").checked=false;
    el("reviewNext").textContent="Check the plan, then tick the approval box.";
  }
  function tracker(){
    const project=state.project;el("trackRows").replaceChildren();
    const done=project.progress.filter(r=>r.status==="Complete").length;
    el("trackHint").textContent=done+" of "+project.progress.length+" complete · manually reported";
    project.plan.stages.forEach((s,i)=>{
      const r=project.progress[i], groupBox=group(el("trackRows"),(i+1)+". "+s.name);
      const indicator=element("small",r.status);groupBox.firstChild.append(indicator);
      groupBox.append(element("p",s.check),element("small","Human action · "+s.human));
      if(!project.prompt)return;
      const label=element("label","Status"),select=element("select");options(select,statuses);select.value=r.status;label.append(select);
      field(groupBox,"note","Evidence or blocker",r.note,v=>{r.note=v;if(!v.trim()&&r.status==="Complete"){r.status=select.value="In progress";indicator.textContent=r.status;}state.dirty=true;count()},true);
      field(groupBox,"next","Next action",r.next,v=>{r.next=v;state.dirty=true});groupBox.append(label);
      function count(){el("trackHint").textContent=project.progress.filter(x=>x.status==="Complete").length+" of "+project.progress.length+" complete · manually reported";}
      select.onchange=()=>{
        if(select.value==="Complete"&&!r.note.trim()){select.value=r.status;message("Enter the observed completion evidence first.");return}
        r.status=select.value;indicator.textContent=r.status;state.dirty=true;count();message("Progress updated. Save a version to keep it.");
      };
    });
  }
  function output(){
    el("prompt").value=state.project.prompt;el("usage").textContent=guidance(state.project.brief,state.project.plan);tracker();tab("review");
  }
  function theme(dark){root.classList.toggle("dark",dark);el("theme").textContent=dark?"☀ Light":"☾ Dark";el("theme").setAttribute("aria-label",dark?"Dark theme active. Switch to light":"Light theme active. Switch to dark");}
  if(!root.dataset.ready){
    root.dataset.ready="1";let dark=matchMedia("(prefers-color-scheme:dark)").matches;
    try{const saved=localStorage.getItem("lps-theme");if(saved)dark=saved==="dark"}catch{}theme(dark);
    for(const mode of Object.keys(modes)){const b=element("button",mode);b.onclick=()=>{if(state.mode!==mode){choose(mode,modes[mode][0]);invalidate()}};el("modes").append(b)}
    choose("Basic","Document or email");tab("brief");
  }
  el("reset").onclick=()=>{
    if(state.dirty&&!confirm("Clear the current draft and progress? Saved versions will remain available."))return;
    state.upload=Symbol();el("propose").disabled=false;
    state.project=null;state.special={};state.files=[];state.stale=true;state.dirty=false;
    for(const id of ["goal","result","material","tools","avoid","context","example","workspace","sourceApp","targetApp","files"])el(id).value="";
    el("runner").value="Node-RED";el("fileList").textContent="";el("approve").checked=false;
    el("reviewFields").replaceChildren();el("appRows").replaceChildren();el("stageRows").replaceChildren();el("trackRows").replaceChildren();
    choose(state.mode,modes[state.mode][0]);tab("brief");message("Draft cleared. Saved versions are unchanged.");
  };
  el("theme").onclick=()=>{theme(!root.classList.contains("dark"));try{localStorage.setItem("lps-theme",root.classList.contains("dark")?"dark":"light")}catch{}};
  el("approve").onchange=()=>{el("reviewNext").textContent=el("approve").checked?"Scope approved. Select Generate package →":"Check the plan, then tick the approval box."};
  el("task").onchange=()=>{choose(state.mode,el("task").value);invalidate()};
  el("brief").oninput=e=>{if(e.target.id!=="files")invalidate()};
  el("files").onchange=async()=>{
    const token=Symbol();state.upload=token;el("propose").disabled=true;invalidate();
    try{
      const files=[...el("files").files];
      const read=f=>/\.(txt|md|csv|json|log|py|js|yaml|yml|html|css|xml|ts)$/i.test(f.name)||f.type.startsWith("text/");
      if(files.filter(read).reduce((n,f)=>n+f.size,0)>2_000_000)throw Error("Text attachments exceed 2 MB. Choose smaller excerpts.");
      const refs=await Promise.all(files.map(async f=>read(f)?{name:f.name,text:await f.text()}:{name:f.name,handling:"Reference only; attach in destination"}));
      if(state.upload!==token)return;state.files=refs;el("fileList").textContent=refs.map(f=>f.name+(f.handling?" (reference only)":"")).join(", ");message("");
    }catch(e){if(state.upload===token){el("files").value="";state.files=[];el("fileList").textContent="";message(e.message)}}
    finally{if(state.upload===token)el("propose").disabled=false}
  };
  el("propose").onclick=()=>{
    try{
      const b=brief(),p=propose(b);
      if(state.project?.prompt&&!confirm("Replace the current package and its tracker with a new proposal?"))return;
      state.project={brief:b,plan:p,prompt:"",progress:p.stages.map(()=>({status:"Not started",note:"",next:""}))};
      state.stale=false;state.dirty=true;review();tracker();tab("review");message("");
    }catch(e){message(e.message)}
  };
  el("addApp").onclick=()=>{const p=state.project;p.plan.apps.push({name:"",role:"",when:"",where:p.plan.workspace,human:"",agent:""});p.prompt="";p.progress=p.plan.stages.map(()=>({status:"Not started",note:"",next:""}));state.dirty=true;review();tracker();tab("review");el("appRows").lastChild.open=true};
  el("generate").onclick=()=>{
    try{
      const p=state.project;
      if(p.plan.apps.some(a=>Object.values(a).some(v=>!v.trim())))throw Error("Complete each tool placement or remove unused tools.");
      if(p.prompt&&!confirm("Regenerate and replace the editable prompt?"))return;
      p.prompt=assemble(p.brief,p.plan);state.dirty=true;output();message("Prompt ready. Copy it into your chosen AI chat.");
    }catch(e){message(e.message)}
  };
  el("briefTab").onclick=()=>tab("brief");el("reviewTab").onclick=()=>tab("review");
  el("prompt").oninput=()=>{state.project.prompt=el("prompt").value;state.dirty=true};
  async function copy(){try{
    if(!state.project.prompt.trim())throw Error("Enter a prompt first.");
    const text=state.project.prompt;
    await navigator.clipboard.writeText(text);message("Prompt copied.");
  }catch(e){message("Copy unavailable. Select the prompt or download the Markdown package.")}}
  el("copyPrompt").onclick=()=>copy();
  el("export").onclick=()=>{const url=URL.createObjectURL(new Blob([packageText(state.project)],{type:"text/markdown;charset=utf-8"}));const a=element("a");a.href=url;a.download="execution-plan.md";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  function event(kind,extra){const id=crypto.randomUUID();state.pending=id;setTriggerValue("action",{id,kind,...extra})}
  el("save").onclick=()=>{if(!state.project.prompt.trim()){message("Enter a prompt first.");return}state.sent=JSON.stringify(state.project);el("save").disabled=true;event("save",{snapshot:state.sent})};
  const previous=el("library").value;
  el("library").replaceChildren(...data.versions.map(v=>new Option("#"+v.id+" · "+v.title,v.id)));
  if(data.versions.some(v=>String(v.id)===previous))el("library").value=previous;
  el("library").disabled=!data.versions.length;
  if(!data.versions.length)el("library").replaceChildren(new Option("No saved packages yet",""));
  el("open").disabled=!data.versions.length;
  el("open").onclick=()=>{if(state.dirty&&!confirm("Replace the current draft with the saved version?"))return;event("open",{version:Number(el("library").value)})};
  const reply=data.reply;
  if(reply&&reply.id===state.pending){state.pending=null;el("save").disabled=false;
    if(reply.error){message(reply.error);return}
    if(reply.project){
      state.project=reply.project;const b=state.project.brief;state.special[b.task]={...b.special};choose(b.mode,b.task);
      for(const [k,v] of Object.entries(b))if(typeof v==="string"&&el(k))el(k).value=v;
      state.files=b.files;el("files").value="";el("fileList").textContent=b.files.map(f=>f.name).join(", ");state.stale=false;review();output();state.dirty=false;message("Saved package reopened.");
    }else{if(JSON.stringify(state.project)===state.sent)state.dirty=false;message("Saved version #"+reply.version+".")}
  }
}

