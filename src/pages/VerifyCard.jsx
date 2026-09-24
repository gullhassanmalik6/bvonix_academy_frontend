import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiShield } from 'react-icons/fi';
import Card from '../components/common/Card';
import { cardService } from '../services/cardService';
import { getApiErrorMessage } from '../services/api';

export default function VerifyCard() {
  const { cardNumber } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardNumber) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await cardService.verifyCard(cardNumber);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(await getApiErrorMessage(err, 'Verification failed'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardNumber]);

  const valid = result?.valid;

  return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiShield className="w-12 h-12 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Card Verification</h1>
          <p className="text-sm text-slate-500 font-mono mb-6">{cardNumber}</p>

          {loading && <p className="text-slate-600">Verifying…</p>}

          {error && (
            <div className="text-red-600 flex items-center justify-center gap-2">
              <FiXCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && result && (
            <>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                  valid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {valid ? (
                  <FiCheckCircle className="w-5 h-5" />
                ) : (
                  <FiXCircle className="w-5 h-5" />
                )}
                {result.message}
              </div>

              {result.student_name && (
                <dl className="text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Student</dt>
                    <dd className="font-semibold text-slate-900">{result.student_name}</dd>
                  </div>
                  {result.course_name && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Course</dt>
                      <dd className="font-semibold text-slate-900">{result.course_name}</dd>
                    </div>
                  )}
                  {result.batch && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Batch</dt>
                      <dd className="font-semibold text-slate-900">{result.batch}</dd>
                    </div>
                  )}
                  {result.enrollment_date && (
                    <div className="flex justify-between pb-2">
                      <dt className="text-slate-500">Enrolled</dt>
                      <dd className="font-semibold text-slate-900">{result.enrollment_date}</dd>
                    </div>
                  )}
                </dl>
              )}
            </>
          )}

          <Link
            to="/"
            className="inline-block mt-8 text-violet-600 hover:text-violet-800 text-sm font-medium"
          >
            Return to Bvonix Academy
          </Link>
        </Card>
      </div>
  );
}
