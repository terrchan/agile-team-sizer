document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ script.js is running after DOM is ready");



  const roles = ['fe', 'be', 'fs', 'ai', 'qa', 'ux', 'sm', 'arch'];

  const roleNames = {

    fe: 'Frontend',

    be: 'Backend',

    fs: 'Full Stack',

    ai: 'AI Dev',

    qa: 'QA',

    ux: 'UX',

    sm: 'Scrum Master',

    arch: 'Architect'

  };



  function getTierConfig(tier) {

    const obj = {};

    roles.forEach(r => {

      obj[r] = parseInt(document.getElementById(`${tier}-${r}`).value) || 0;

    });

    return obj;

  }



  function getPool() {

    const pool = {};

    roles.forEach(r => {

      pool[r] = parseInt(document.getElementById(`pool-${r}`).value) || 0;

    });

    pool.total = parseInt(document.getElementById('total-people').value) || 0;

    return pool;

  }



  document.getElementById("calculate").addEventListener("click", () => {

    console.log("✅ Run Allocation button was clicked!");



    const tierCfg = {

      small: getTierConfig('small'),

      medium: getTierConfig('medium'),

      large: getTierConfig('large')

    };

    const pool = getPool();



    const used = {};

    roles.forEach(r => used[r] = 0);

    used.total = 0;



    const alloc = [];



    const stages = Array.from(document.querySelectorAll('.stage')).map(stageDiv => {

      const stageName = stageDiv.querySelector('.stage-name').value || stageDiv.id;

      const projectSizes = Array.from(stageDiv.querySelectorAll('.project-item .size-select')).map(el => el.value);

      return { stageName, projectSizes };

    });



    stages.forEach(({ stageName, projectSizes }) => {

      projectSizes.forEach((tier, idx) => {

        const req = tierCfg[tier];

        const assign = {};

        let feasible = true;



        roles.forEach(r => {

          const need = req[r];

          assign[r] = need;

          if ((used[r] + need) > pool[r]) feasible = false;

        });



        const reqCount = roles.reduce((sum, r) => sum + req[r], 0);

        if ((used.total + reqCount) > pool.total) feasible = false;



        if (feasible) {

          roles.forEach(r => used[r] += req[r]);

          used.total += reqCount;

        }



        alloc.push({ stage: stageName, project: idx + 1, tier, assign, feasible });

      });

    });



    // Render Results

    const resDiv = document.getElementById('results');

    resDiv.innerHTML = '';

    alloc.forEach(a => {

      const lines = roles.map(r => `<li>${roleNames[r]}: ${a.assign[r]}</li>`).join('');

      resDiv.innerHTML += `<div class="proj-result">

        <h4>${a.stage} – Project ${a.project} (${a.tier}) – ${a.feasible ? '✅ Staffed' : '❌ Cannot Staff'}</h4>

        <ul>${lines}</ul>

      </div>`;

    });



    const remDiv = document.getElementById('remaining');

    remDiv.innerHTML = '<ul>' + roles.map(r => `<li>${roleNames[r]}: ${pool[r] - used[r]}</li>`).join('') + '</ul>';

  });

// Enable "Add Stage" button

  document.getElementById('add-stage').addEventListener('click', addStage);



  function addStage() {

    const stageCount = document.querySelectorAll('.stage').length + 1;

    const stageDiv = document.createElement('div');

    stageDiv.className = 'stage';

    stageDiv.innerHTML = `

      <div class="stage-header">

        <input type="text" class="stage-name" value="Stage ${stageCount}">

        <button class="remove-stage">Remove Stage</button>

      </div>

      <button class="add-project">Add Project</button>

      <div class="project-list" id="project-list-${stageCount}"></div>

    `;



    document.getElementById('stages-container').appendChild(stageDiv);



    // Remove Stage button

    stageDiv.querySelector('.remove-stage').addEventListener('click', () => stageDiv.remove());



    // Add Project button

    stageDiv.querySelector('.add-project').addEventListener('click', () => {

      const pl = stageDiv.querySelector('.project-list');

      const div = document.createElement('div');

      div.className = 'project-item';

      div.innerHTML = `

        <select class="size-select">

          <option value="small">Small</option>

          <option value="medium">Medium</option>

          <option value="large">Large</option>

        </select>

        <button class="remove-proj">Remove</button>

      `;

      pl.appendChild(div);

      div.querySelector('.remove-proj').onclick = () => div.remove();

    });



    // Enable drag & drop

    new Sortable(stageDiv.querySelector('.project-list'), {

      group: 'stage-group',

      animation: 150

    });

  }



  // Add one stage by default

  addStage();

});
