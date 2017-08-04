var db = require('../../main/db');
var doc;

describe("rescheduler", function(){

  beforeEach(function() {
    doc = {
      word: '世界',
      nextRep: new Date('2017/07/03 00:00:00'),
      lastInterval: 86400,
      lastRepDate: new Date('2017/06/02 00:00:00'),
      repCount: 0
    };
  });


  it("works on different documents (deep copies)", function() {

    var newDoc = db.rescheduleDoc(doc, 100);

    expect(doc.repCount).toEqual(0);
    expect(newDoc.repCount).toEqual(1);
    expect(doc.lastInterval).toEqual(86400);
    expect(newDoc.lastInterval).toEqual(86400 * 2);
  });


  it("new intervals are correct", function() {

    expect(db.rescheduleDoc(doc, 100).lastInterval).toEqual(86400 * 2);
    expect(db.rescheduleDoc(doc, 50).lastInterval).toEqual(86400);
    expect(db.rescheduleDoc(doc, 0).lastInterval).toEqual(0);
    expect(db.rescheduleDoc(doc, 75).lastInterval).toEqual(129600);
    expect(db.rescheduleDoc(doc, 25).lastInterval).toEqual(86400 * 0.5);
    expect(db.rescheduleDoc(doc, 10).lastInterval).toEqual(86400 * 0.2);

  });

  it("intervals are integers", function() {
    expect(db.rescheduleDoc(doc, 100).lastInterval % 1).toEqual(0);
    expect(db.rescheduleDoc(doc, 50.34).lastInterval % 1).toEqual(0);
    expect(db.rescheduleDoc(doc, 0.11).lastInterval % 1).toEqual(0);
    expect(db.rescheduleDoc(doc, 75).lastInterval % 1).toEqual(0);
    expect(db.rescheduleDoc(doc, 25).lastInterval % 1).toEqual(0);
    expect(db.rescheduleDoc(doc, 10.4).lastInterval % 1).toEqual(0);

  });


  it("correct repcounts", function() {

    for(i=0; i<175; i++){
      doc = db.rescheduleDoc(doc, 1);
    }

    expect(doc.repCount).toEqual(175);

    for(i=0; i<124; i++){
      doc = db.rescheduleDoc(doc, 1);
    }

    expect(doc.repCount).toEqual(175 + 124);
  });



  it("new dates are correct 1", function() {

    doc = {
      word: '世界',
      nextRep: new Date('2017/07/03 00:00:00'),
      lastInterval: 1,
      repCount: 0
    };

    doc = db.rescheduleDoc(doc, 100);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:02'));

    doc = db.rescheduleDoc(doc, 100);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:06'));

    doc = db.rescheduleDoc(doc, 100);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:14'));

    doc = db.rescheduleDoc(doc, 50);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:22'));

    doc = db.rescheduleDoc(doc, 50);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:30'));

    doc = db.rescheduleDoc(doc, 25);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:34'));

    doc = db.rescheduleDoc(doc, 0);
    expect(doc.nextRep).toEqual(new Date('2017/07/03 00:00:34'));

  });

  it("new dates are correct 2", function() {

    doc = db.rescheduleDoc(doc, 50);
    expect(doc.nextRep).toEqual(new Date('2017/07/04 00:00:00'));

    doc = db.rescheduleDoc(doc, 100);
    expect(doc.nextRep).toEqual(new Date('2017/07/06 00:00:00'));

    doc = db.rescheduleDoc(doc, 23);
    expect(doc.nextRep).toEqual(new Date('2017/07/06 22:04:48'));

    doc = db.rescheduleDoc(doc, 78);
    expect(doc.nextRep).toEqual(new Date('2017/07/08 08:31:29'));

    doc = db.rescheduleDoc(doc, 10);
    expect(doc.nextRep).toEqual(new Date('2017/07/08 15:24:49'));

  });

  it("new dates are correct 3 (using fromNow = true, alwaysReschedule = true)", function() {

    var now = new Date();
    var copyNow;

    doc = db.rescheduleDoc(doc, 50, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 86400);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());

    doc = db.rescheduleDoc(doc, 100, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 172800);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());

    doc = db.rescheduleDoc(doc, 23, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 79488);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());

    doc = db.rescheduleDoc(doc, 78, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 124001);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());

    doc = db.rescheduleDoc(doc, 10, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 24800);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());

    doc = db.rescheduleDoc(doc, 100, { fromNow: true, alwaysReschedule: true });
    nowCopy = new Date(now);
    nowCopy.setSeconds(nowCopy.getSeconds() + 24800 * 2);
    expect(doc.nextRep.toString()).toEqual(nowCopy.toString());
  });


  it("doesn't reschedule if the card isn't due yet 1", function() {
    var first, newDoc;

    doc.nextRep = new Date();
    doc.nextRep.setSeconds(doc.nextRep.getSeconds() + 1);
    first = doc.nextRep.toString();
    newDoc = db.rescheduleDoc(doc, 100);
    expect(newDoc.nextRep.toString()).toEqual(first);

  });

  it("doesn't reschedule if the card isn't due yet 2", function() {
    var first, newDoc;

    doc.nextRep = new Date();
    first = doc.nextRep.toString();
    newDoc = db.rescheduleDoc(doc, 100);
    expect(newDoc.nextRep.toString()).toEqual(first);

  });

  it("doesn't reschedule if the card isn't due yet 3", function() {
    var first, newDoc;
    doc.nextRep = new Date();
    doc.nextRep.setSeconds(doc.nextRep.getSeconds() - 1); // one second less than it should
    first = new Date(doc.nextRep);
    first.setSeconds(first.getSeconds() + (86400 * 2));
    newDoc = db.rescheduleDoc(doc, 100);
    expect(newDoc.nextRep.toString()).toEqual(first.toString()); // milliseconds
  });



  it("last rep date gets updated correctly", function() {
    var now = new Date();
    doc = db.rescheduleDoc(doc, 100);
    expect(doc.lastRepDate).toEqual(now);
  });
});
