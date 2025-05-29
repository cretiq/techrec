'use client';

import React from 'react';

export default function DaisyUITestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DaisyUI Test Page</h1>
        <p className="text-lg text-base-content/70">Testing DaisyUI components installation</p>
      </div>

      {/* Button Tests */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Button Components</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn">Default</button>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-info">Info</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-warning">Warning</button>
            <button className="btn btn-error">Error</button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="btn btn-outline">Outline</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-link">Link</button>
            <button className="btn btn-sm">Small</button>
            <button className="btn btn-lg">Large</button>
          </div>
        </div>
      </div>

      {/* Input Tests */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Input Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Default input" className="input input-bordered w-full" />
            <input type="text" placeholder="Primary input" className="input input-bordered input-primary w-full" />
            <input type="text" placeholder="Secondary input" className="input input-bordered input-secondary w-full" />
            <input type="text" placeholder="Accent input" className="input input-bordered input-accent w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <select className="select select-bordered w-full">
              <option disabled selected>Pick your favorite language</option>
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>Go</option>
            </select>
            <textarea className="textarea textarea-bordered" placeholder="Bio"></textarea>
          </div>
        </div>
      </div>

      {/* Badge Tests */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Badge Components</h2>
          <div className="flex flex-wrap gap-2">
            <div className="badge">Default</div>
            <div className="badge badge-primary">Primary</div>
            <div className="badge badge-secondary">Secondary</div>
            <div className="badge badge-accent">Accent</div>
            <div className="badge badge-info">Info</div>
            <div className="badge badge-success">Success</div>
            <div className="badge badge-warning">Warning</div>
            <div className="badge badge-error">Error</div>
          </div>
        </div>
      </div>

      {/* Modal Test */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Modal Component</h2>
          <button className="btn btn-primary" onClick={() => (document.getElementById('my_modal_1') as HTMLDialogElement)?.showModal()}>
            Open Modal
          </button>
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">This is a DaisyUI modal component test.</p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>

      {/* Tabs Test */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Tabs Component</h2>
          <div className="tabs tabs-boxed">
            <a className="tab tab-active">Tab 1</a>
            <a className="tab">Tab 2</a>
            <a className="tab">Tab 3</a>
          </div>
        </div>
      </div>

      {/* Navbar Test */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Navbar Component</h2>
          <div className="navbar bg-base-200 rounded-box">
            <div className="flex-1">
              <a className="btn btn-ghost text-xl">daisyUI</a>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal px-1">
                <li><a>Link</a></li>
                <li>
                  <details>
                    <summary>Parent</summary>
                    <ul className="bg-base-100 rounded-t-none p-2">
                      <li><a>Link 1</a></li>
                      <li><a>Link 2</a></li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Test */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Theme Test</h2>
          <p>Current theme colors:</p>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-primary text-primary-content p-2 rounded text-center text-sm">Primary</div>
            <div className="bg-secondary text-secondary-content p-2 rounded text-center text-sm">Secondary</div>
            <div className="bg-accent text-accent-content p-2 rounded text-center text-sm">Accent</div>
            <div className="bg-neutral text-neutral-content p-2 rounded text-center text-sm">Neutral</div>
            <div className="bg-base-100 text-base-content p-2 rounded border text-center text-sm">Base 100</div>
            <div className="bg-base-200 text-base-content p-2 rounded text-center text-sm">Base 200</div>
            <div className="bg-base-300 text-base-content p-2 rounded text-center text-sm">Base 300</div>
            <div className="bg-info text-info-content p-2 rounded text-center text-sm">Info</div>
            <div className="bg-success text-success-content p-2 rounded text-center text-sm">Success</div>
            <div className="bg-warning text-warning-content p-2 rounded text-center text-sm">Warning</div>
            <div className="bg-error text-error-content p-2 rounded text-center text-sm">Error</div>
          </div>
        </div>
      </div>
    </div>
  );
} 