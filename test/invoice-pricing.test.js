'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice figures match the billed GST, split, total, and HSN line rates', function () {
  var order = {
    items: [
      { id: 8, sku: 'BEV-001', name: 'Tea', hsn: '0902', price: 140, qty: 2 },
      { id: 2, sku: 'GRN-002', name: 'Dal', hsn: '0713', price: 165, qty: 2 }
    ],
    coupon: '',
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    total: 676.9
  };

  var figures = invoice.computeInvoiceFigures(order);

  assert.equal(figures.subtotal, 610);
  assert.equal(figures.discount, 0);
  assert.equal(figures.tax, order.tax);
  assert.equal(figures.cgst, 33.45);
  assert.equal(figures.sgst, 33.45);
  assert.equal(figures.total, order.total);
  assert.deepEqual(figures.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 18, lineTax: 50.4 },
    { gstPercent: 5, lineTax: 16.5 }
  ]);
});

test('CURRENT BEHAVIOUR: order pricing applies the HSN slab and discounts before GST', function () {
  var items = [{
    id: 1,
    sku: 'RICE-001',
    name: 'Rice',
    hsn: '1006',
    price: 100,
    qty: 1
  }];

  var billed = pricing.computeTotals(items, 'WELCOME');

  assert.equal(billed.subtotal, 100);
  assert.equal(billed.discount, 5);
  assert.equal(billed.tax, 4.75);
  assert.equal(billed.cgst, 2.38);
  assert.equal(billed.sgst, 2.37);
  assert.equal(billed.total, 99.75);
  assert.deepEqual(billed.lines[0], {
    id: 1,
    name: 'Rice',
    hsn: '1006',
    gstPercent: 5,
    gross: 100,
    discount: 5,
    taxable: 95,
    tax: 4.75,
    net: 99.75
  });
});

test('invoice resolves HSN slabs and matches pricing for a discounted line', function () {
  var order = {
    items: [{ id: 1, sku: 'RICE-001', name: 'Rice', hsn: '1006', price: 100, qty: 1 }],
    coupon: 'WELCOME'
  };

  var figures = invoice.computeInvoiceFigures(order);

  assert.equal(figures.subtotal, 100);
  assert.equal(figures.rows[0].gstPercent, 5);
  assert.equal(figures.rows[0].lineTax, 4.75);
  assert.equal(figures.tax, 4.75);
  assert.equal(figures.cgst, 2.38);
  assert.equal(figures.sgst, 2.37);
  assert.equal(figures.discount, 5);
  assert.equal(figures.total, 99.75);
});

test('invoice applies coupon cap and post-discount GST like order pricing', function () {
  var items = [{ id: 2, sku: 'RICE-002', name: 'Bulk rice', hsn: '1006', price: 3000, qty: 1 }];
  var billed = pricing.computeTotals(items, 'WHOLESALE15');
  var order = {
    items: items,
    coupon: 'WHOLESALE15',
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    total: billed.total
  };
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(billed.discount, 400);
  assert.equal(billed.tax, 130);
  assert.equal(billed.total, 2730);
  assert.equal(invoiceFigures.tax, billed.tax);
  assert.equal(invoiceFigures.discount, billed.discount);
  assert.equal(invoiceFigures.total, billed.total);
  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.rows[0].lineTax, billed.lines[0].tax);
});
