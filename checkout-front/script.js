(() => {
  const plans = {
    essencial: {
      name: 'Super Essencial',
      price: '149',
      description: 'Organize montagens e orçamentos em um só lugar.',
      reviewDescription: 'Montagens e orçamentos em um só lugar.',
      benefits: ['Montagens', 'Orçamentos', 'Kanban de orçamentos e montagens', '1 usuário incluído', 'Montagem assistida por IA'],
    },
    profissional: {
      name: 'Super Profissional',
      price: '349',
      description: 'Mais recursos para corte e acompanhamento da produção.',
      reviewDescription: 'Mais recursos para corte e acompanhamento da produção.',
      benefits: ['Tudo do Super Essencial', 'Otimização de cortes', 'Apontamento da produção', 'Impressão de etiquetas', 'Integração com estribadeira', '3 usuários incluídos', 'Usuário adicional: R$ 39'],
    },
  };

  const form = document.querySelector('#company-form');
  const steps = [...document.querySelectorAll('[data-step]')];
  const indicators = [...document.querySelectorAll('[data-step-indicator]')];
  const error = document.querySelector('[data-form-error]');
  const digits = (value) => value.replace(/\D/g, '');
  let currentPlan = 'essencial';
  const selectedPlan = () => currentPlan;
  const formatCnpj = (value) => digits(value).slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
  const formatPhone = (value) => {
    const number = digits(value).slice(0, 11);
    if (number.length < 3) return number ? `(${number}` : '';
    if (number.length < 7) return `(${number.slice(0, 2)}) ${number.slice(2)}`;
    const split = number.length > 10 ? 7 : 6;
    return `(${number.slice(0, 2)}) ${number.slice(2, split)}-${number.slice(split)}`;
  };

  function updatePlan() {
    const plan = plans[selectedPlan()];
    document.querySelectorAll('[data-summary-plan]').forEach((el) => { el.textContent = plan.name; });
    document.querySelector('[data-summary-description]').textContent = plan.description;
    document.querySelector('[data-summary-price]').textContent = `R$ ${plan.price}`;
    document.querySelector('[data-benefits-list]').innerHTML = plan.benefits.map((item) => `<li>${item}</li>`).join('');
    document.querySelector('[data-review-plan]').textContent = plan.name;
    document.querySelector('[data-review-plan-description]').textContent = plan.reviewDescription;
    document.querySelector('[data-review-price]').innerHTML = `R$ ${plan.price}<span>/mês</span>`;
  }

  function setStep(step) {
    document.body.dataset.checkoutStep = String(step);
    steps.forEach((panel) => { panel.hidden = Number(panel.dataset.step) !== step; });
    indicators.forEach((item) => {
      const active = Number(item.dataset.stepIndicator) === step;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    error.hidden = true;
    document.querySelector('#form-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(message, field) {
    error.textContent = message;
    error.hidden = false;
    if (field) field.focus();
    error.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelector('#cnpj').addEventListener('input', (event) => { event.target.value = formatCnpj(event.target.value); });
  document.querySelector('#phone').addEventListener('input', (event) => { event.target.value = formatPhone(event.target.value); });

  const workspace = document.querySelector('#workspace');
  workspace.addEventListener('input', () => {
    const value = workspace.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    workspace.value = value;
    document.querySelector('[data-workspace-preview]').innerHTML = `Seu endereço: <strong>${value || 'minhaempresa'}.ferroarmado.ai</strong>`;
  });

  document.querySelector('[data-reveal-password]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const field = document.querySelector('#password');
    const reveal = field.type === 'password';
    field.type = reveal ? 'text' : 'password';
    button.textContent = reveal ? 'Ocultar' : 'Mostrar';
    button.setAttribute('aria-label', reveal ? 'Ocultar senha' : 'Mostrar senha');
    button.setAttribute('aria-pressed', String(reveal));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('[data-step="1"] input[required]')];
    const empty = fields.find((field) => !field.value.trim());
    if (empty) return showError('Preencha os campos obrigatórios para revisar os dados.', empty);

    const cnpj = document.querySelector('#cnpj');
    if (digits(cnpj.value).length !== 14) return showError('Confira o CNPJ: ele deve ter 14 números.', cnpj);
    const email = document.querySelector('#email');
    const emailConfirm = document.querySelector('#email-confirm');
    if (!email.checkValidity()) return showError('Informe um e-mail corporativo válido.', email);
    if (!emailConfirm.checkValidity()) return showError('Informe um e-mail válido para confirmação.', emailConfirm);
    if (email.value.trim().toLowerCase() !== emailConfirm.value.trim().toLowerCase()) {
      return showError('Os e-mails estão diferentes. Confira os dois campos.', emailConfirm);
    }
    const phone = document.querySelector('#phone');
    if (digits(phone.value).length < 10) return showError('Confira o número de WhatsApp ou celular.', phone);
    if (workspace.value.length < 3) return showError('O identificador precisa ter pelo menos 3 caracteres.', workspace);
    const password = document.querySelector('#password');
    if (password.value.length < 8) return showError('Crie uma senha com pelo menos 8 caracteres.', password);

    const values = new FormData(form);
    const plan = plans[selectedPlan()];
    document.querySelector('[data-review-company]').textContent = values.get('tradeName') || values.get('legalName');
    document.querySelector('[data-review-cnpj]').textContent = values.get('cnpj');
    document.querySelector('[data-review-email]').textContent = values.get('email');
    document.querySelector('[data-review-phone]').textContent = values.get('phone');
    document.querySelector('[data-review-workspace]').textContent = `${values.get('workspace')}.ferroarmado.ai`;
    document.querySelector('[data-review-plan]').textContent = plan.name;
    setStep(2);
  });

  document.querySelector('[data-back-step]').addEventListener('click', () => setStep(1));
  document.querySelector('[data-edit-details]').addEventListener('click', () => setStep(1));
  const requestedPlan = new URLSearchParams(window.location.search).get('plano');
  if (Object.hasOwn(plans, requestedPlan)) currentPlan = requestedPlan;
  document.body.dataset.checkoutStep = '1';
  updatePlan();
})();
